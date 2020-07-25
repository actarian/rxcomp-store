export default class StorageService {
    static encode(value) {
        let encodedJson = null;
        try {
            const cache = new Map();
            const json = JSON.stringify(value, function (key, value) {
                if (typeof value === 'object' && value != null) {
                    if (cache.has(value)) {
                        // Circular reference found, discard key
                        return;
                    }
                    cache.set(value, true);
                }
                return value;
            });
            encodedJson = btoa(encodeURIComponent(json));
        }
        catch (error) {
            console.warn('StorageService.encode.error', value, error);
        }
        return encodedJson;
    }
    static decode(encodedJson) {
        let value;
        if (encodedJson) {
            try {
                value = JSON.parse(decodeURIComponent(atob(encodedJson)));
            }
            catch (error) {
                // console.warn('StorageService.decode.error', encodedJson);
                value = encodedJson;
            }
        }
        return value;
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
