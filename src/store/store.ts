import { produce } from 'immer';
import { BehaviorSubject, defer, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map } from 'rxjs/operators';
import CookieStorageService from '../storage/cookie-storage.service';
import LocalStorageService from '../storage/local-storage.service';
import SessionStorageService from '../storage/session-storage.service';

export enum StoreType {
	Memory = 1,
	Session = 2,
	Local = 3,
	Cookie = 4,
};

export interface IStore {
	busy$: () => Observable<null>,
	reducer: <T, R>(reducer: (data: T, draft: any) => R) => (source: Observable<T>) => Observable<any>,
	push: (callback: (draft: any) => any) => any,
	select: (callback: (draft: any) => any) => any,
	select$: (callback: (draft: any) => any) => any,
	cached$: (callback: (draft: any) => any) => any,
	catchState: (error?: any) => any,
	state$: Observable<any>,
}

export class Store {

	type: StoreType;
	key: string;
	state$: Observable<any>;

	get state() {
		return this.select((draft: any) => draft);
	}

	set state(callback: (draft: any) => any) {
		this.push(callback);
	}

	constructor(state: any = {}, type = StoreType.Memory, key: string = 'store') {
		this.type = type;
		this.key = `rxcomp_${key}`;
		state.busy = false;
		state.error = null;
		const state_ = new BehaviorSubject(state);
		this.push = makeSetState(state_);
		this.select = makeSelectState(state_);
		this.select$ = makeSelectState$(state_);
		this.state$ = state_.asObservable();
	}

	busy$(): Observable<null> {
		return of(null).pipe(
			filter(() => {
				let busy = this.select(state => state.busy);
				if (!busy) {
					this.state = (draft: any) => {
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

	cached$(callback: (value: any) => any): Observable<any> {
		return of(null).pipe(
			map(() => {
				let value = null;
				if (this.type === StoreType.Local) {
					value = LocalStorageService.get(this.key);
				} else if (this.type === StoreType.Session) {
					value = SessionStorageService.get(this.key);
				} else if (this.type === StoreType.Cookie) {
					value = CookieStorageService.get(this.key);
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

	select$(callback: (draft: any) => any): Observable<any> { return of(); }

	select(callback: (draft: any) => any): any { }

	push(callback: (draft: any) => any): void { }

	reducer<T, R>(reducer: (data: T, draft: any) => R) {
		return (source: Observable<T>) => defer(() => {
			// initialize global values
			return source.pipe(
				map((data: T) => {
					if (typeof reducer === 'function') {
						this.state = (draft: any) => {
							draft.error = null;
							reducer(data, draft);
							draft.busy = false;
							if (this.type === StoreType.Local) {
								LocalStorageService.set(this.key, draft);
								// console.log('push.LocalStorageService.set', this.key, draft);
							}
							if (this.type === StoreType.Session) {
								SessionStorageService.set(this.key, draft);
								// console.log('push.SessionStorageService.set', this.key, draft);
							}
							if (this.type === StoreType.Cookie) {
								CookieStorageService.set(this.key, draft, 365);
								// console.log('push.CookieStorageService.set', this.key, draft);
							}
						};
					}
					return data;
				}),
			);
		});
	};

	catchState(errorReducer?: (error: any) => any): (source: Observable<any>) => Observable<any> {
		return (source: Observable<any>) =>
			defer(() => {
				// initialize global values
				return source.pipe(
					catchError(error => {
						this.state = (draft: any) => {
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

export function useStore(state: any, type?: StoreType, key?: string): IStore {
	const store = new Store(state, type, key);
	return {
		state$: store.state$,
		busy$: store.busy$.bind(store),
		cached$: store.cached$.bind(store),
		select$: store.select$.bind(store),
		select: store.select.bind(store),
		push: store.push.bind(store),
		reducer: store.reducer.bind(store),
		catchState: store.catchState.bind(store),
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

/*





*/

function busy$(store: Store): Observable<null> {
	return of(null).pipe(
		filter(() => {
			let busy = store.select(state => state.busy);
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

function push(store: Store): (callback: (draft: any) => any) => any {
	return (callback: (draft: any) => any) => {
		let output;
		store.state = (draft: any) => {
			draft.error = null;
			output = callback(draft);
			draft.busy = false;
			if (store.type === StoreType.Local) {
				LocalStorageService.set(store.key, draft);
				// console.log('push.LocalStorageService.set', store.key, draft);
			}
			if (store.type === StoreType.Session) {
				SessionStorageService.set(store.key, draft);
				// console.log('push.SessionStorageService.set', store.key, draft);
			}
			if (store.type === StoreType.Cookie) {
				CookieStorageService.set(store.key, draft, 365);
				// console.log('push.CookieStorageService.set', store.key, draft);
			}
		};
		return output;
	};
}

function catchState(store: Store): (error: any) => (source: Observable<any>) => Observable<any> {
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

function reducer(store: Store): <T, R>(reducer: (data: T, draft: any) => R) => (source: Observable<T>) => Observable<any> {
	return function reducer<T, R>(reducer: (data: T, draft: any) => R) {
		return (source: Observable<T>) => defer(() => {
			// initialize global values
			return source.pipe(
				map((data: T) => {
					if (typeof reducer === 'function') {
						store.state = (draft: any) => {
							draft.error = null;
							reducer(data, draft);
							draft.busy = false;
							if (store.type === StoreType.Local) {
								LocalStorageService.set(store.key, draft);
								// console.log('push.LocalStorageService.set', store.key, draft);
							}
							if (store.type === StoreType.Session) {
								SessionStorageService.set(store.key, draft);
								// console.log('push.SessionStorageService.set', store.key, draft);
							}
							if (store.type === StoreType.Cookie) {
								CookieStorageService.set(store.key, draft, 365);
								// console.log('push.CookieStorageService.set', store.key, draft);
							}
						};
					}
					return data;
				}),
			);
		});
	};
}

function cached$(store: Store, callback: (value: any) => any): Observable<any> {
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
