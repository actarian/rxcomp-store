"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var storage_service_1 = tslib_1.__importDefault(require("./storage.service"));
var CookieStorageService = /** @class */ (function (_super) {
    tslib_1.__extends(CookieStorageService, _super);
    function CookieStorageService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CookieStorageService.clear = function () {
        var _this = this;
        this.toRawArray().forEach(function (x) {
            _this.setter(x.name, '', -1);
            // document.cookie = `${x.name}= ; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
        });
    };
    CookieStorageService.delete = function (name) {
        this.setter(name, '', -1);
    };
    CookieStorageService.exist = function (name) {
        return document.cookie.indexOf(';' + name + '=') !== -1 || document.cookie.indexOf(name + '=') === 0;
    };
    CookieStorageService.get = function (name) {
        return this.decode(this.getRaw(name));
    };
    CookieStorageService.set = function (name, value, days) {
        this.setter(name, this.encode(value), days);
    };
    CookieStorageService.getRaw = function (name) {
        var value = null;
        var cookies = this.toRawArray();
        var cookie = cookies.find(function (x) { return x.name === name; });
        if (cookie) {
            value = cookie.value;
        }
        return value;
    };
    CookieStorageService.setRaw = function (name, value, days) {
        this.setter(name, value, days);
    };
    CookieStorageService.toArray = function () {
        var _this = this;
        return this.toRawArray().map(function (x) {
            x.value = _this.decode(x.value);
            return x;
        });
    };
    CookieStorageService.toRawArray = function () {
        return document.cookie.split(';').map(function (x) {
            var items = x.split('=');
            return { name: items[0].trim(), value: items[1] ? items[1].trim() : null };
        }).filter(function (x) { return x.name !== ''; });
    };
    CookieStorageService.setter = function (name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        else {
            expires = '';
        }
        document.cookie = name + '=' + value + expires + '; path=/';
        this.items$.next(this.toArray());
    };
    CookieStorageService.isSupported = function () {
        var isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
        return isBrowser;
    };
    CookieStorageService.items$ = new rxjs_1.ReplaySubject(1);
    return CookieStorageService;
}(storage_service_1.default));
exports.default = CookieStorageService;
