import { produce } from 'immer';
import { BehaviorSubject, defer, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map } from 'rxjs/operators';
import CookieStorageService from '../storage/cookie-storage.service';
import LocalStorageService from '../storage/local-storage.service';
import SessionStorageService from '../storage/session-storage.service';

function busyState$(store: Store): Observable<null> {
	return of(null).pipe(
		filter(() => {
			let busy = store.selectState(state => state.busy);
			if (!busy) {
				store.state = (draft: any) => {
					draft.busy = true;
					draft.error = null;
				};
				return true;
			} else {
				return false;
			}
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
			if (store.type === StoreType.Cookie) {
				CookieStorageService.set(store.key, draft, 365);
				// console.log('setState.CookieStorageService.set', store.key, draft);
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

function catchErrorState(store: Store): (error: any) => (source: Observable<any>) => Observable<any> {
	return (errorReducer?: (error: any) => any) => {
		return (source: Observable<any>) =>
			defer(() => {
				// initialize global values
				return source.pipe(
					catchError(error => {
						store.state = (draft: any) => {
							draft.error = error;
							draft.busy = false;
						};
						if (typeof errorReducer === 'function') {
							error = errorReducer(error);
						} else {
							error = null;
						}
						return (error ? of(error) : of());
					})
				);
			});
	};
}

/*
export function mapData<T, R>(callback: (data: T) => R) : OperatorFunction<T, R>
export function mapData<T extends { data: any }>() : OperatorFunction<T, T['data']>
export function mapData<T>() : OperatorFunction<T, T>
export function mapData<T extends { data? : undefined } | { data: R }, R>(callback?: (data: T) => R) {
  return (source: Observable<T>) => source.pipe(
    map(value => typeof callback === 'function' ? callback(value) : (value.data ? value.data : value)),
  );
}
*/
function reduceState(store: Store): <T, R>(stateReducer: (data: T, draft: any) => R) => (source: Observable<T>) => Observable<any> {
	return function reduceState<T, R>(stateReducer: (data: T, draft: any) => R) {
		return (source: Observable<T>) => defer(() => {
			// initialize global values
			return source.pipe(
				map((data: T) => {
					if (typeof stateReducer === 'function') {
						store.state = (draft: any) => {
							draft.error = null;
							stateReducer(data, draft);
							draft.busy = false;
							if (store.type === StoreType.Local) {
								LocalStorageService.set(store.key, draft);
								// console.log('setState.LocalStorageService.set', store.key, draft);
							}
							if (store.type === StoreType.Session) {
								SessionStorageService.set(store.key, draft);
								// console.log('setState.SessionStorageService.set', store.key, draft);
							}
							if (store.type === StoreType.Cookie) {
								CookieStorageService.set(store.key, draft, 365);
								// console.log('setState.CookieStorageService.set', store.key, draft);
							}
						};
					}
					return data;
				}),
			);
		});
	};
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

function makeSelectState(state: BehaviorSubject<any>): (callback: (draft: any) => any) => any {
	return (callback: (draft: any) => any) => {
		return callback(state.getValue());
	};
}

function makeSelectState$(state: BehaviorSubject<any>): (callback: (draft: any) => any) => Observable<any> {
	return (callback: (draft: any) => any) => {
		return state.pipe(
			map(callback),
			distinctUntilChanged()
		);
	};
}

function cachedState$(store: Store, callback: (value: any) => any): Observable<any> {
	return of(null).pipe(
		map(() => {
			let value = null;
			if (store.type === StoreType.Local) {
				value = LocalStorageService.get(store.key);
			} else if (store.type === StoreType.Session) {
				value = SessionStorageService.get(store.key);
			} else if (store.type === StoreType.Cookie) {
				value = CookieStorageService.get(store.key);
			}
			if (value && typeof callback === 'function') {
				value = callback(value);
			}
			return value;
		}),
		filter((x) => {
			// console.log('value', x);
			return x != null;
		})
	);
}

export enum StoreType {
	Memory = 1,
	Session = 2,
	Local = 3,
	Cookie = 4,
};

export class Store {

	type: StoreType;
	key: string;
	state$: Observable<any>;

	get state() {
		return this.selectState((draft: any) => draft);
	}

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
		this.selectState = makeSelectState(state_);
		this.selectState$ = makeSelectState$(state_);
		this.state$ = state_.asObservable();
	}

	setState(callback: (draft: any) => any): void { }

	selectState(callback: (draft: any) => any): any { }

	selectState$(callback: (draft: any) => any): Observable<any> { return of(); }

}

export interface IStore {
	busyState$: () => Observable<null>,
	setState: (callback: (draft: any) => any) => any,
	reduceState: <T, R>(stateReducer: (data: T, draft: any) => R) => (source: Observable<T>) => Observable<any>,
	selectState: (callback: (draft: any) => any) => any,
	selectState$: (callback: (draft: any) => any) => any,
	cachedState$: (callback: (draft: any) => any) => any,
	setError: (error: any) => Observable<void>,
	catchErrorState: (error?: any) => any,
	state$: Observable<any>,
}

export function useStore(state: any, type?: StoreType, key?: string): IStore {
	const store = new Store(state, type, key);
	return {
		busyState$: () => busyState$(store),
		setState: setState(store),
		reduceState: reduceState(store),
		selectState: store.selectState,
		selectState$: store.selectState$,
		cachedState$: (callback: (draft: any) => any) => cachedState$(store, callback),
		setError: setError(store),
		catchErrorState: catchErrorState(store),
		state$: store.state$,
	};
}

