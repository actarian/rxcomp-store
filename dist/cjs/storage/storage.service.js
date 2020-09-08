"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxcomp_1 = require("rxcomp");
var StorageService = /** @class */ (function () {
    function StorageService() {
    }
    StorageService.encode = function (decoded) {
        var encoded = rxcomp_1.Serializer.encode(decoded, [rxcomp_1.encodeJson, encodeURIComponent, rxcomp_1.encodeBase64]) || null;
        return encoded;
    };
    StorageService.decode = function (encoded) {
        var decoded = rxcomp_1.Serializer.decode(encoded, [rxcomp_1.decodeBase64, decodeURIComponent, rxcomp_1.decodeJson]);
        return decoded;
    };
    StorageService.isSupported = function (type) {
        var flag = false;
        var storage;
        try {
            storage = rxcomp_1.WINDOW[type];
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
