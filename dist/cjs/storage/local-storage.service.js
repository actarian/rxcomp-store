"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var storage_service_1 = tslib_1.__importDefault(require("./storage.service"));
var LocalStorageService = /** @class */ (function (_super) {
    tslib_1.__extends(LocalStorageService, _super);
    function LocalStorageService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LocalStorageService.clear = function () {
        if (this.isSupported()) {
            localStorage.clear();
            this.items$.next(this.toArray());
        }
    };
    LocalStorageService.delete = function (name) {
        if (this.isSupported()) {
            localStorage.removeItem(name);
            this.items$.next(this.toArray());
        }
    };
    LocalStorageService.exist = function (name) {
        if (this.isSupported()) {
            return localStorage.getItem(name) !== undefined;
        }
        else {
            return false;
        }
    };
    LocalStorageService.get = function (name) {
        return this.decode(this.getRaw(name));
    };
    LocalStorageService.set = function (name, value) {
        this.setRaw(name, this.encode(value));
    };
    LocalStorageService.getRaw = function (name) {
        var value = null;
        if (this.isSupported()) {
            value = localStorage.getItem(name);
        }
        return value;
    };
    LocalStorageService.setRaw = function (name, value) {
        if (value && this.isSupported()) {
            localStorage.setItem(name, value);
            this.items$.next(this.toArray());
        }
    };
    LocalStorageService.toArray = function () {
        var _this = this;
        return this.toRawArray().map(function (x) {
            x.value = _this.decode(x.value);
            return x;
        });
    };
    LocalStorageService.toRawArray = function () {
        var _this = this;
        if (this.isSupported()) {
            return Object.keys(localStorage).map(function (key) {
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
    LocalStorageService.isSupported = function () {
        if (this.supported) {
            return true;
        }
        return storage_service_1.default.isSupported('localStorage');
        /*
        let supported = false;
        try {
            supported = 'localStorage' in window && localStorage !== null;
            if (supported) {
                localStorage.setItem('test', '1');
                localStorage.removeItem('test');
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
    LocalStorageService.items$ = new rxjs_1.ReplaySubject(1);
    return LocalStorageService;
}(storage_service_1.default));
exports.default = LocalStorageService;
