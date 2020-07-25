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
	next: (callback: (draft: any) => any) => any,
	nextError: (error: any) => Observable<any>,
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
		this.next(callback);
	}

	constructor(state: any = {}, type = StoreType.Memory, key: string = 'store') {
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

	select$(callback: (draft: any) => any): Observable<any> {
		return this.state$.pipe(
			map(callback),
			distinctUntilChanged()
		);
	}

	select(callback: (draft: any) => any): any { }

	next(callback: (draft: any) => any): void { }

	nextError(error: any): Observable<any> {
		return of();
	}

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
		next: store.next.bind(store),
		nextError: store.nextError.bind(store),
		reducer: store.reducer.bind(store),
		catchState: store.catchState.bind(store),
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

function makeNext(state: BehaviorSubject<any>): (callback: (draft: any) => any) => void {
	return (callback: (draft: any) => any) => {
		state.next(produce(state.getValue(), (draft: any) => {
			if (typeof callback === 'function') {
				callback(draft);
			}
			return draft;
		}));
	};
}

function makeNextError(state: BehaviorSubject<any>): (error: any) => Observable<any> {
	return (error?: any) => {
		state.next(produce(state.getValue(), (draft: any) => {
			draft.error = error;
			draft.busy = false;
			return draft;
		}));
		return of(error);
	};
}

function makeSelect(state: BehaviorSubject<any>): (callback: (draft: any) => any) => any {
	return (callback: (draft: any) => any) => {
		return callback(state.getValue());
	};
}
