"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SessionStorageService = /** @class */ (function () {
    function SessionStorageService() {
    }
    SessionStorageService.clear = function () {
        if (this.isSessionStorageSupported()) {
            sessionStorage.clear();
        }
    };
    SessionStorageService.delete = function (name) {
        if (this.isSessionStorageSupported()) {
            sessionStorage.removeItem(name);
        }
    };
    SessionStorageService.exist = function (name) {
        if (this.isSessionStorageSupported()) {
            return sessionStorage.getItem(name) !== undefined;
        }
        else {
            return false;
        }
    };
    SessionStorageService.get = function (name) {
        var value = null;
        if (this.isSessionStorageSupported()) {
            try {
                var item = sessionStorage.getItem(name);
                if (item != null) {
                    value = JSON.parse(item);
                }
            }
            catch (error) {
                console.log('SessionStorageService.get.error parsing', name, error);
            }
        }
        return value;
    };
    SessionStorageService.set = function (name, value) {
        if (this.isSessionStorageSupported()) {
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
                sessionStorage.setItem(name, json);
            }
            catch (error) {
                console.log('SessionStorageService.set.error serializing', name, value, error);
            }
        }
    };
    SessionStorageService.isSessionStorageSupported = function () {
        if (this.supported) {
            return true;
        }
        var supported = false;
        try {
            supported = 'sessionStorage' in window && sessionStorage !== null;
            if (supported) {
                sessionStorage.setItem('test', '1');
                sessionStorage.removeItem('test');
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
    SessionStorageService.supported = false;
    return SessionStorageService;
}());
exports.default = SessionStorageService;
