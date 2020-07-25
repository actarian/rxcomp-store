import { ReplaySubject } from "rxjs";
import StorageService, { IStorageItem } from "./storage.service";
export default class SessionStorageService extends StorageService {
    static items$: ReplaySubject<IStorageItem[]>;
    static clear(): void;
    static delete(name: string): void;
    static exist(name: string): boolean;
    static get(name: string): any;
    static set(name: string, value: any): void;
    static getRaw(name: string): string | null;
    static setRaw(name: string, value: string | null): void;
    static toArray(): IStorageItem[];
    static toRawArray(): IStorageItem[];
    static isSupported(): boolean;
}
