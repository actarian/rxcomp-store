import { decodeBase64, decodeJson, encodeBase64, encodeJson, Serializer } from 'rxcomp';
export default class StorageService {
    static encode(decoded) {
        let encoded = Serializer.encode(decoded, [encodeJson, encodeURIComponent, encodeBase64]) || null;
        return encoded;
    }
    static decode(encoded) {
        let decoded = Serializer.decode(encoded, [decodeBase64, decodeURIComponent, decodeJson]);
        return decoded;
    }
    static isSupported(type) {
        let flag = false;
        let storage;
        try {
            storage = window[type];
            const x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            flag = true;
        }
        catch (error) {
            flag = error instanceof DOMException && (
            // everything except Firefox
            error.code === 22 ||
                // Firefox
                error.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                error.name === 'QuotaExceededError' ||
                // Firefox
                error.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                Boolean(storage && storage.length !== 0);
        }
        return flag;
    }
}
StorageService.supported = false;
