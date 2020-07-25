"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStore = exports.Store = exports.StoreType = void 0;
var tslib_1 = require("tslib");
var immer_1 = require("immer");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var cookie_storage_service_1 = tslib_1.__importDefault(require("../storage/cookie-storage.service"));
var local_storage_service_1 = tslib_1.__importDefault(require("../storage/local-storage.service"));
var session_storage_service_1 = tslib_1.__importDefault(require("../storage/session-storage.service"));
var StoreType;
(function (StoreType) {
    StoreType[StoreType["Memory"] = 1] = "Memory";
    StoreType[StoreType["Session"] = 2] = "Session";
    StoreType[StoreType["Local"] = 3] = "Local";
    StoreType[StoreType["Cookie"] = 4] = "Cookie";
})(StoreType = exports.StoreType || (exports.StoreType = {}));
;
var Store = /** @class */ (function () {
    function Store(state, type, key) {
        if (state === void 0) { state = {}; }
        if (type === void 0) { type = StoreType.Memory; }
        if (key === void 0) { key = 'store'; }
        this.type = type;
        this.key = "rxcomp_" + key;
        state.busy = false;
        state.error = null;
        var state_ = new rxjs_1.BehaviorSubject(state);
        this.next = makeNext(state_);
        this.nextError = makeNextError(state_);
        this.select = makeSelect(state_);
        this.state$ = state_.asObservable();
    }
    Object.defineProperty(Store.prototype, "state", {
        get: function () {
            return this.select(function (draft) { return draft; });
        },
        set: function (callback) {
            this.next(callback);
        },
        enumerable: false,
        configurable: true
    });
    Store.prototype.busy$ = function () {
        var _this = this;
        return rxjs_1.of(null).pipe(operators_1.filter(function () {
            var busy = _this.select(function (state) { return state.busy; });
            if (!busy) {
                _this.state = function (draft) {
                    draft.busy = true;
                    draft.error = null;
                };
                return true;
            }
            else {
                return false;
            }
        }));
    };
    Store.prototype.cached$ = function (callback) {
        var _this = this;
        return rxjs_1.of(null).pipe(operators_1.map(function () {
            var value = null;
            if (_this.type === StoreType.Local) {
                value = local_storage_service_1.default.get(_this.key);
            }
            else if (_this.type === StoreType.Session) {
                value = session_storage_service_1.default.get(_this.key);
            }
            else if (_this.type === StoreType.Cookie) {
                value = cookie_storage_service_1.default.get(_this.key);
            }
            if (value && typeof callback === 'function') {
                value = callback(value);
            }
            return value;
        }), operators_1.filter(function (x) {
            // console.log('value', x);
            return x != null;
        }));
    };
    Store.prototype.select$ = function (callback) {
        return this.state$.pipe(operators_1.map(callback), operators_1.distinctUntilChanged());
    };
    Store.prototype.select = function (callback) { };
    Store.prototype.next = function (callback) { };
    Store.prototype.nextError = function (error) {
        return rxjs_1.of();
    };
    Store.prototype.reducer = function (reducer) {
        var _this = this;
        return function (source) { return rxjs_1.defer(function () {
            // initialize global values
            return source.pipe(operators_1.map(function (data) {
                if (typeof reducer === 'function') {
                    _this.state = function (draft) {
                        draft.error = null;
                        reducer(data, draft);
                        draft.busy = false;
                        if (_this.type === StoreType.Local) {
                            local_storage_service_1.default.set(_this.key, draft);
                            // console.log('reducer.LocalStorageService.set', this.key, draft);
                        }
                        if (_this.type === StoreType.Session) {
                            session_storage_service_1.default.set(_this.key, draft);
                            // console.log('reducer.SessionStorageService.set', this.key, draft);
                        }
                        if (_this.type === StoreType.Cookie) {
                            cookie_storage_service_1.default.set(_this.key, draft, 365);
                            // console.log('reducer.CookieStorageService.set', this.key, draft);
                        }
                    };
                }
                return data;
            }));
        }); };
    };
    ;
    Store.prototype.catchState = function (errorReducer) {
        var _this = this;
        return function (source) {
            return rxjs_1.defer(function () {
                // initialize global values
                return source.pipe(operators_1.catchError(function (error) {
                    _this.state = function (draft) {
                        draft.error = error;
                        draft.busy = false;
                    };
                    if (typeof errorReducer === 'function') {
                        error = errorReducer(error);
                    }
                    else {
                        error = null;
                    }
                    return (error ? rxjs_1.of(error) : rxjs_1.of());
                }));
            });
        };
    };
    ;
    return Store;
}());
exports.Store = Store;
function useStore(state, type, key) {
    var store = new Store(state, type, key);
    return {
        state$: store.state$,
        busy$: store.busy$.bind(store),
        cached$: store.cached$.bind(store),
        select$: store.select$.bind(store),
        select: store.select.bind(store),
        next: store.next.bind(store),
        nextError: store.nextError.bind(store),
        reducer: store.reducer.bind(store),
        catchState: store.catchState.bind(store),
    };
}
exports.useStore = useStore;
/*
export function makeNext<T, R>(callback: (data: T) => R) : OperatorFunction<T, R>
export function makeNext<T extends { data: any }>() : OperatorFunction<T, T['data']>
export function makeNext<T>() : OperatorFunction<T, T>
export function makeNext<T extends { data? : undefined } | { data: R }, R>(callback?: (data: T) => R) {
  return (source: Observable<T>) => source.pipe(
    map(value => typeof callback === 'function' ? callback(value) : (value.data ? value.data : value)),
  );
}
*/
function makeNext(state) {
    return function (callback) {
        state.next(immer_1.produce(state.getValue(), function (draft) {
            if (typeof callback === 'function') {
                callback(draft);
            }
            return draft;
        }));
    };
}
function makeNextError(state) {
    return function (error) {
        state.next(immer_1.produce(state.getValue(), function (draft) {
            draft.error = error;
            draft.busy = false;
            return draft;
        }));
        return rxjs_1.of(error);
    };
}
function makeSelect(state) {
    return function (callback) {
        return callback(state.getValue());
    };
}
