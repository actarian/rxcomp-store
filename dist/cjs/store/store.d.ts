import { Observable } from 'rxjs';
export declare enum StoreType {
    Memory = 1,
    Session = 2,
    Local = 3
}
export declare class Store {
    type: StoreType;
    key: string;
    state$: Observable<any>;
    set state(callback: (draft: any) => any);
    constructor(state?: any, type?: StoreType, key?: string);
    setState(callback: (draft: any) => any): void;
}
export interface IStore {
    busy: () => Observable<any>;
    getState: (callback: (draft: any) => any) => any;
    setState: (callback: (draft: any) => any) => any;
    setError: (error: any) => Observable<void>;
    state$: Observable<any>;
}
export declare function useStore(state: any, type?: StoreType, key?: string): IStore;
