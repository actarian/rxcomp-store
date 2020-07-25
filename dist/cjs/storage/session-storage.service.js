"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var storage_service_1 = tslib_1.__importDefault(require("./storage.service"));
var SessionStorageService = /** @class */ (function (_super) {
    tslib_1.__extends(SessionStorageService, _super);
    function SessionStorageService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SessionStorageService.clear = function () {
        if (this.isSupported()) {
            sessionStorage.clear();
            this.items$.next(this.toArray());
        }
    };
    SessionStorageService.delete = function (name) {
        if (this.isSupported()) {
            sessionStorage.removeItem(name);
            this.items$.next(this.toArray());
        }
    };
    SessionStorageService.exist = function (name) {
        if (this.isSupported()) {
            return sessionStorage.getItem(name) !== undefined;
        }
        else {
            return false;
        }
    };
    SessionStorageService.get = function (name) {
        return this.decode(this.getRaw(name));
    };
    SessionStorageService.set = function (name, value) {
        this.setRaw(name, this.encode(value));
    };
    SessionStorageService.getRaw = function (name) {
        var value = null;
        if (this.isSupported()) {
            value = sessionStorage.getItem(name);
        }
        return value;
    };
    SessionStorageService.setRaw = function (name, value) {
        if (value && this.isSupported()) {
            sessionStorage.setItem(name, value);
            this.items$.next(this.toArray());
        }
    };
    SessionStorageService.toArray = function () {
        var _this = this;
        return this.toRawArray().map(function (x) {
            x.value = _this.decode(x.value);
            return x;
        });
    };
    SessionStorageService.toRawArray = function () {
        var _this = this;
        if (this.isSupported()) {
            return Object.keys(sessionStorage).map(function (key) {
                return {
                    name: key,
                    value: _this.getRaw(key),
                };
            });
        }
        else {
            return [];
        }
    };
    SessionStorageService.isSupported = function () {
        if (this.supported) {
            return true;
        }
        return storage_service_1.default.isSupported('sessionStorage');
        /*
        let supported = false;
        try {
            supported = 'sessionStorage' in window && sessionStorage !== null;
            if (supported) {
                sessionStorage.setItem('test', '1');
                sessionStorage.removeItem('test');
            } else {
                supported = false;
            }
        } catch (error) {
            supported = false;
        }
        this.supported = supported;
        return supported;
        */
    };
    SessionStorageService.items$ = new rxjs_1.ReplaySubject(1);
    return SessionStorageService;
}(storage_service_1.default));
exports.default = SessionStorageService;
