import { produce } from 'immer';
import { BehaviorSubject, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import LocalStorageService from '../storage/local-storage.service';
import SessionStorageService from '../storage/session-storage.service';
function busy(store) {
    return of(null).pipe(filter(() => {
        let busy;
        store.state = (draft) => {
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
    return (callback) => {
        let output;
        store.state = (draft) => {
            draft.error = null;
            output = callback(draft);
            draft.busy = false;
            if (store.type === StoreType.Local) {
                LocalStorageService.set(store.key, draft);
                // console.log('setState.LocalStorageService.set', store.key, draft);
            }
            if (store.type === StoreType.Session) {
                SessionStorageService.set(store.key, draft);
                // console.log('setState.SessionStorageService.set', store.key, draft);
            }
        };
        return output;
    };
}
function setError(store) {
    return (error) => {
        store.state = (draft) => {
            draft.error = error;
            draft.busy = false;
        };
        return of();
    };
}
function getState(store, callback) {
    return of(null).pipe(map(() => {
        let value = null;
        if (store.type === StoreType.Local) {
            value = LocalStorageService.get(store.key);
            if (value && typeof callback === 'function') {
                value = callback(value);
            }
            // console.log('getLocal.LocalStorageService.get', store.key, value);
        }
        else if (store.type === StoreType.Session) {
            value = SessionStorageService.get(store.key);
            if (value && typeof callback === 'function') {
                value = callback(value);
            }
            // console.log('getLocal.SessionStorageService.get', store.key, value);
        }
        return value;
    }), filter((x) => {
        // console.log('value', x);
        return x !== null;
    }));
}
function makeSetState(state) {
    return (callback) => {
        state.next(produce(state.getValue(), (draft) => {
            if (typeof callback === 'function') {
                callback(draft);
            }
            return draft;
        }));
    };
}
export var StoreType;
(function (StoreType) {
    StoreType[StoreType["Memory"] = 1] = "Memory";
    StoreType[StoreType["Session"] = 2] = "Session";
    StoreType[StoreType["Local"] = 3] = "Local";
})(StoreType || (StoreType = {}));
;
export class Store {
    constructor(state = {}, type = StoreType.Memory, key = 'store') {
        this.type = type;
        this.key = `rxcomp_${key}`;
        state.busy = false;
        state.error = null;
        const state_ = new BehaviorSubject(state);
        this.setState = makeSetState(state_);
        this.state$ = state_.asObservable();
    }
    set state(callback) {
        this.setState(callback);
    }
    setState(callback) { }
}
export function useStore(state, type, key) {
    const store = new Store(state, type, key);
    return {
        busy: () => busy(store),
        getState: (callback) => getState(store, callback),
        setState: setState(store),
        setError: setError(store),
        state$: store.state$,
    };
}
