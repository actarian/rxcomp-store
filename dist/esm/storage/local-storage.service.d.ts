export default class LocalStorageService {
    static supported: boolean;
    static clear(): void;
    static delete(name: string): void;
    static exist(name: string): boolean;
    static get(name: string): any;
    static set(name: string, value: any): void;
    static isLocalStorageSupported(): boolean;
}
