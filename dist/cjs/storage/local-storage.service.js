"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LocalStorageService = /** @class */ (function () {
    function LocalStorageService() {
    }
    LocalStorageService.clear = function () {
        if (this.isLocalStorageSupported()) {
            localStorage.clear();
        }
    };
    LocalStorageService.delete = function (name) {
        if (this.isLocalStorageSupported()) {
            localStorage.removeItem(name);
        }
    };
    LocalStorageService.exist = function (name) {
        if (this.isLocalStorageSupported()) {
            return localStorage.getItem(name) !== undefined;
        }
        else {
            return false;
        }
    };
    LocalStorageService.get = function (name) {
        var value = null;
        if (this.isLocalStorageSupported()) {
            try {
                var item = localStorage.getItem(name);
                if (item != null) {
                    value = JSON.parse(item);
                }
            }
            catch (error) {
                console.log('LocalStorageService.get.error parsing', name, error);
            }
        }
        return value;
    };
    LocalStorageService.set = function (name, value) {
        if (this.isLocalStorageSupported()) {
            try {
                var cache_1 = new Map();
                var json = JSON.stringify(value, function (key, value) {
                    if (typeof value === 'object' && value !== null) {
                        if (cache_1.has(value)) {
                            // Circular reference found, discard key
                            return;
                        }
                        cache_1.set(value, true);
                    }
                    return value;
                });
                localStorage.setItem(name, json);
            }
            catch (error) {
                console.log('LocalStorageService.set.error serializing', name, value, error);
            }
        }
    };
    LocalStorageService.isLocalStorageSupported = function () {
        if (this.supported) {
            return true;
        }
        var supported = false;
        try {
            supported = 'localStorage' in window && localStorage !== null;
            if (supported) {
                localStorage.setItem('test', '1');
                localStorage.removeItem('test');
            }
            else {
                supported = false;
            }
        }
        catch (error) {
            supported = false;
        }
        this.supported = supported;
        return supported;
    };
    LocalStorageService.supported = false;
    return LocalStorageService;
}());
exports.default = LocalStorageService;
