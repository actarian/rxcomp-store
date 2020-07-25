import { ReplaySubject } from "rxjs";
import StorageService from "./storage.service";
export default class CookieStorageService extends StorageService {
    static clear() {
        this.toRawArray().forEach(x => {
            this.setter(x.name, '', -1);
            // document.cookie = `${x.name}= ; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
        });
    }
    static delete(name) {
        this.setter(name, '', -1);
    }
    static exist(name) {
        return document.cookie.indexOf(';' + name + '=') !== -1 || document.cookie.indexOf(name + '=') === 0;
    }
    static get(name) {
        return this.decode(this.getRaw(name));
    }
    static set(name, value, days) {
        this.setter(name, this.encode(value), days);
    }
    static getRaw(name) {
        let value = null;
        const cookies = this.toRawArray();
        const cookie = cookies.find(x => x.name === name);
        if (cookie) {
            value = cookie.value;
        }
        return value;
    }
    static setRaw(name, value, days) {
        this.setter(name, value, days);
    }
    static toArray() {
        return this.toRawArray().map(x => {
            x.value = this.decode(x.value);
            return x;
        });
    }
    static toRawArray() {
        return document.cookie.split(';').map(x => {
            const items = x.split('=');
            return { name: items[0].trim(), value: items[1] ? items[1].trim() : null };
        }).filter(x => x.name !== '');
    }
    static setter(name, value, days) {
        let expires;
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        else {
            expires = '';
        }
        document.cookie = name + '=' + value + expires + '; path=/';
        this.items$.next(this.toArray());
    }
    static isSupported() {
        const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
        return isBrowser;
    }
}
CookieStorageService.items$ = new ReplaySubject(1);
