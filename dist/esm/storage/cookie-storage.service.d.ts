import { ReplaySubject } from "rxjs";
import StorageService, { IStorageItem } from "./storage.service";
export default class CookieStorageService extends StorageService {
    static items$: ReplaySubject<IStorageItem[]>;
    static clear(): void;
    static delete(name: string): void;
    static exist(name: string): boolean;
    static get(name: string): any;
    static set(name: string, value: any, days?: number): void;
    static getRaw(name: string): string | null;
    static setRaw(name: string, value: string, days?: number): void;
    static toArray(): IStorageItem[];
    static toRawArray(): IStorageItem[];
    static setter(name: string, value: any, days?: number): void;
    static isSupported(): boolean;
}
