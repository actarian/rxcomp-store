"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StorageService = /** @class */ (function () {
    function StorageService() {
    }
    StorageService.encode = function (value) {
        var encodedJson = null;
        try {
            var cache_1 = new Map();
            var json = JSON.stringify(value, function (key, value) {
                if (typeof value === 'object' && value != null) {
                    if (cache_1.has(value)) {
                        // Circular reference found, discard key
                        return;
                    }
                    cache_1.set(value, true);
                }
                return value;
            });
            encodedJson = btoa(encodeURIComponent(json));
        }
        catch (error) {
            console.warn('StorageService.encode.error', value, error);
        }
        return encodedJson;
    };
    StorageService.decode = function (encodedJson) {
        var value;
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
    };
    StorageService.isSupported = function (type) {
        var flag = false;
        var storage;
        try {
            storage = window[type];
            var x = '__storage_test__';
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
    };
    StorageService.supported = false;
    return StorageService;
}());
exports.default = StorageService;
