export interface IStorageItem {
    name: string;
    value: any;
}
export default class StorageService {
    static supported: boolean;
    static encode(decoded: any): string | null;
    static decode(encoded: string | null): any;
    static isSupported(type: 'localStorage' | 'sessionStorage'): boolean;
}
