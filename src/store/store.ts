import { produce } from 'immer';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import LocalStorageService from '../storage/local-storage.service';
import SessionStorageService from '../storage/session-storage.service';

function busy(store: Store): Observable<any> {
	return of(null).pipe(
		filter(() => {
			let busy;
			store.state = (draft: any) => {
				busy = draft.busy;
				if (!busy) {
					draft.busy = true;
					draft.error = null;
				}
			};
			return !busy;
		})
	);
}

function setState(store: Store): (callback: (draft: any) => any) => any {
	return (callback: (draft: any) => any) => {
		let output;
		store.state = (draft: any) => {
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

function setError(store: Store): (error: any) => Observable<void> {
	return (error: any) => {
		store.state = (draft: any) => {
			draft.error = error;
			draft.busy = false;
		};
		return of();
	};
}

function getState(store: Store, callback: (value: any) => any): Observable<any> {
	return of(null).pipe(
		map(() => {
			let value = null;
			if (store.type === StoreType.Local) {
				value = LocalStorageService.get(store.key);
				if (value && typeof callback === 'function') {
					value = callback(value);
				}
				// console.log('getLocal.LocalStorageService.get', store.key, value);
			} else if (store.type === StoreType.Session) {
				value = SessionStorageService.get(store.key);
				if (value && typeof callback === 'function') {
					value = callback(value);
				}
				// console.log('getLocal.SessionStorageService.get', store.key, value);
			}
			return value;
		}),
		filter((x) => {
			// console.log('value', x);
			return x !== null;
		})
	);
}

function makeSetState(state: BehaviorSubject<any>): (callback: (draft: any) => any) => void {
	return (callback: (draft: any) => any) => {
		state.next(produce(state.getValue(), (draft: any) => {
			if (typeof callback === 'function') {
				callback(draft);
			}
			return draft;
		}));
	};
}

export enum StoreType {
	Memory = 1,
	Session = 2,
	Local = 3,
};

export class Store {

	type: StoreType;
	key: string;
	state$: Observable<any>;

	set state(callback: (draft: any) => any) {
		this.setState(callback);
	}

	constructor(state: any = {}, type = StoreType.Memory, key: string = 'store') {
		this.type = type;
		this.key = `rxcomp_${key}`;
		state.busy = false;
		state.error = null;
		const state_ = new BehaviorSubject(state);
		this.setState = makeSetState(state_);
		this.state$ = state_.asObservable();
	}

	setState(callback: (draft: any) => any): void { }
}

export interface IStore {
	busy: () => Observable<any>,
	getState: (callback: (draft: any) => any) => any,
	setState: (callback: (draft: any) => any) => any,
	setError: (error: any) => Observable<void>,
	state$: Observable<any>,
}

export function useStore(state: any, type?: StoreType, key?: string): IStore {
	const store = new Store(state, type, key);
	return {
		busy: () => busy(store),
		getState: (callback: (draft: any) => any) => getState(store, callback),
		setState: setState(store),
		setError: setError(store),
		state$: store.state$,
	};
}

