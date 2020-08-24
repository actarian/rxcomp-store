import { produce } from 'immer';
import { BehaviorSubject, defer, of, Subject, throwError, timer } from 'rxjs';
import { catchError, delayWhen, distinctUntilChanged, filter, map, retryWhen, switchMap, takeUntil, tap } from 'rxjs/operators';
import CookieStorageService from '../storage/cookie-storage.service';
import LocalStorageService from '../storage/local-storage.service';
import SessionStorageService from '../storage/session-storage.service';
export var StoreType;
(function (StoreType) {
    StoreType[StoreType["Memory"] = 1] = "Memory";
    StoreType[StoreType["Session"] = 2] = "Session";
    StoreType[StoreType["Local"] = 3] = "Local";
    StoreType[StoreType["Cookie"] = 4] = "Cookie";
})(StoreType || (StoreType = {}));
;
export class Store {
    constructor(state = {}, type = StoreType.Memory, key = 'store') {
        this.cancel$ = new Subject;
        this.type = type;
        this.key = `rxcomp_${key}`;
        state.busy = false;
        state.error = null;
        const state_ = new BehaviorSubject(state);
        this.next = makeNext(state_);
        this.nextError = makeNextError(state_);
        this.select = makeSelect(state_);
        this.state$ = state_.asObservable();
    }
    get state() {
        return this.select((draft) => draft);
    }
    set state(callback) {
        this.next(callback);
    }
    busy$() {
        return of(null).pipe(filter(() => {
            let busy = this.select(state => state.busy);
            if (!busy) {
                this.state = (draft) => {
                    draft.busy = true;
                    draft.error = null;
                    draft.retry = null;
                };
                return true;
            }
            else {
                return false;
            }
        }), takeUntil(this.cancel$));
    }
    cached$(callback) {
        return of(null).pipe(map(() => {
            let value = null;
            if (this.type === StoreType.Local) {
                value = LocalStorageService.get(this.key);
            }
            else if (this.type === StoreType.Session) {
                value = SessionStorageService.get(this.key);
            }
            else if (this.type === StoreType.Cookie) {
                value = CookieStorageService.get(this.key);
            }
            if (value && typeof callback === 'function') {
                value = callback(value);
            }
            return value;
        }), filter((x) => {
            // console.log('value', x);
            return x != null;
        }));
    }
    select$(callback) {
        return this.state$.pipe(map(callback), distinctUntilChanged());
    }
    select(callback) { }
    next(callback) { }
    nextError(error) {
        return of();
    }
    reducer(reducer) {
        return (source) => defer(() => {
            // initialize global values
            return source.pipe(map((data) => {
                if (typeof reducer === 'function') {
                    this.state = (draft) => {
                        draft.error = null;
                        draft.retry = null;
                        reducer(data, draft);
                        draft.busy = false;
                        if (this.type === StoreType.Local) {
                            LocalStorageService.set(this.key, draft);
                            // console.log('reducer.LocalStorageService.set', this.key, draft);
                        }
                        if (this.type === StoreType.Session) {
                            SessionStorageService.set(this.key, draft);
                            // console.log('reducer.SessionStorageService.set', this.key, draft);
                        }
                        if (this.type === StoreType.Cookie) {
                            CookieStorageService.set(this.key, draft, 365);
                            // console.log('reducer.CookieStorageService.set', this.key, draft);
                        }
                    };
                }
                return data;
            }));
        });
    }
    ;
    retryState(times = 3, delay = 1000) {
        return (source) => defer(() => {
            // initialize global values
            let i = 0;
            return source.pipe(retryWhen((errors) => errors.pipe(delayWhen(() => timer(delay)), switchMap((error) => {
                // next((draft: any) => draft.busy = false);
                if (i < times) {
                    i++;
                    this.state = (draft) => {
                        draft.retry = i;
                    };
                    return of(i);
                }
                else {
                    return throwError(error);
                }
            }))));
        });
    }
    ;
    catchState(errorReducer) {
        return (source) => defer(() => {
            // initialize global values
            return source.pipe(takeUntil(this.cancel$.pipe(tap(() => {
                this.state = (draft) => {
                    draft.busy = false;
                    draft.retry = null;
                };
            }))), catchError(error => {
                this.state = (draft) => {
                    draft.error = error;
                    draft.busy = false;
                    draft.retry = null;
                };
                if (typeof errorReducer === 'function') {
                    error = errorReducer(error);
                }
                else {
                    error = null;
                }
                return (error ? of(error) : of());
            }));
        });
    }
    ;
    cancel() {
        this.cancel$.next();
    }
}
export function useStore(state, type, key) {
    const store = new Store(state, type, key);
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
        retryState: store.retryState.bind(store),
        cancel: store.cancel.bind(store),
    };
}
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
    return (callback) => {
        state.next(produce(state.getValue(), (draft) => {
            if (typeof callback === 'function') {
                callback(draft);
            }
            return draft;
        }));
    };
}
function makeNextError(state) {
    return (error) => {
        state.next(produce(state.getValue(), (draft) => {
            draft.error = error;
            draft.busy = false;
            draft.retry = null;
            return draft;
        }));
        return of(error);
    };
}
function makeSelect(state) {
    return (callback) => {
        return callback(state.getValue());
    };
}
