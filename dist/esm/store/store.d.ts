import { Observable, Subject } from 'rxjs';
export declare enum StoreType {
    Memory = 1,
    Session = 2,
    Local = 3,
    Cookie = 4
}
export interface IStore {
    busy$: () => Observable<null>;
    reducer: <T, R>(reducer: (data: T, draft: any) => R) => (source: Observable<T>) => Observable<any>;
    next: (callback: (draft: any) => any) => any;
    nextError: (error: any) => Observable<any>;
    select: (callback: (draft: any) => any) => any;
    select$: (callback: (draft: any) => any) => any;
    cached$: (callback: (draft: any) => any) => any;
    catchState: (error?: any) => any;
    retryState: (times?: number, delay?: number) => (source: Observable<any>) => Observable<any>;
    cancel: () => void;
    state$: Observable<any>;
}
export declare class Store {
    type: StoreType;
    key: string;
    state$: Observable<any>;
    cancel$: Subject<void>;
    get state(): (draft: any) => any;
    set state(callback: (draft: any) => any);
    constructor(state?: any, type?: StoreType, key?: string);
    busy$(): Observable<null>;
    cached$(callback: (value: any) => any): Observable<any>;
    select$(callback: (draft: any) => any): Observable<any>;
    select(callback: (draft: any) => any): any;
    next(callback: (draft: any) => any): void;
    nextError(error: any): Observable<any>;
    reducer<T, R>(reducer: (data: T, draft: any) => R): (source: Observable<T>) => Observable<T>;
    retryState(times?: number, delay?: number): (source: Observable<any>) => Observable<unknown>;
    catchState(errorReducer?: (error: any) => any): (source: Observable<any>) => Observable<any>;
    cancel(): void;
}
export declare function useStore(state: any, type?: StoreType, key?: string): IStore;
