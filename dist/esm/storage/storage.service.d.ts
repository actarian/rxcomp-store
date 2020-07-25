export interface IStorageItem {
    name: string;
    value: any;
}
export default class StorageService {
    static supported: boolean;
    static encode(value: any): string | null;
    static decode(encodedJson: string | null): any;
    static isSupported(type: 'localStorage' | 'sessionStorage'): boolean;
}
