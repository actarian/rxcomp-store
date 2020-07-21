"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var immer_1 = require("immer");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var local_storage_service_1 = tslib_1.__importDefault(require("../storage/local-storage.service"));
var session_storage_service_1 = tslib_1.__importDefault(require("../storage/session-storage.service"));
function busy(store) {
    return rxjs_1.of(null).pipe(operators_1.filter(function () {
        var busy;
        store.state = function (draft) {
            busy = draft.busy;
            if (!busy) {
                draft.busy = true;
                draft.error = null;
            }
        };
        return !busy;
    }));
}
function setState(store) {
    return function (callback) {
        var output;
        store.state = function (draft) {
            draft.error = null;
            output = callback(draft);
            draft.busy = false;
            if (store.type === StoreType.Local) {
                local_storage_service_1.default.set(store.key, draft);
                // console.log('setState.LocalStorageService.set', store.key, draft);
            }
            if (store.type === StoreType.Session) {
                session_storage_service_1.default.set(store.key, draft);
                // console.log('setState.SessionStorageService.set', store.key, draft);
            }
        };
        return output;
    };
}
function setError(store) {
    return function (error) {
        store.state = function (draft) {
            draft.error = error;
            draft.busy = false;
        };
        return rxjs_1.of();
    };
}
function getState(store, callback) {
    return rxjs_1.of(null).pipe(operators_1.map(function () {
        var value = null;
        if (store.type === StoreType.Local) {
            value = local_storage_service_1.default.get(store.key);
            if (value && typeof callback === 'function') {
                value = callback(value);
            }
            // console.log('getLocal.LocalStorageService.get', store.key, value);
        }
        else if (store.type === StoreType.Session) {
            value = session_storage_service_1.default.get(store.key);
            if (value && typeof callback === 'function') {
                value = callback(value);
            }
            // console.log('getLocal.SessionStorageService.get', store.key, value);
        }
        return value;
    }), operators_1.filter(function (x) {
        // console.log('value', x);
        return x !== null;
    }));
}
function makeSetState(state) {
    return function (callback) {
        state.next(immer_1.produce(state.getValue(), function (draft) {
            if (typeof callback === 'function') {
                callback(draft);
            }
            return draft;
        }));
    };
}
var StoreType;
(function (StoreType) {
    StoreType[StoreType["Memory"] = 1] = "Memory";
    StoreType[StoreType["Session"] = 2] = "Session";
    StoreType[StoreType["Local"] = 3] = "Local";
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
        this.setState = makeSetState(state_);
        this.state$ = state_.asObservable();
    }
    Object.defineProperty(Store.prototype, "state", {
        set: function (callback) {
            this.setState(callback);
        },
        enumerable: true,
        configurable: true
    });
    Store.prototype.setState = function (callback) { };
    return Store;
}());
exports.Store = Store;
function useStore(state, type, key) {
    var store = new Store(state, type, key);
    return {
        busy: function () { return busy(store); },
        getState: function (callback) { return getState(store, callback); },
        setState: setState(store),
        setError: setError(store),
        state$: store.state$,
    };
}
exports.useStore = useStore;
