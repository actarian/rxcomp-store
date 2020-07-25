"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var rxcomp_1 = require("rxcomp");
var operators_1 = require("rxjs/operators");
var local_storage_service_1 = tslib_1.__importDefault(require("./local-storage.service"));
var LocalStorageComponent = /** @class */ (function (_super) {
    tslib_1.__extends(LocalStorageComponent, _super);
    function LocalStorageComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.active = false;
        _this.items = [];
        return _this;
    }
    LocalStorageComponent.prototype.onInit = function () {
        var _this = this;
        this.items = local_storage_service_1.default.toArray();
        local_storage_service_1.default.items$.pipe(operators_1.takeUntil(this.unsubscribe$)).subscribe(function (items) {
            _this.items = items;
            _this.pushChanges();
        });
    };
    LocalStorageComponent.prototype.onToggle = function () {
        this.active = !this.active;
        this.pushChanges();
    };
    LocalStorageComponent.prototype.onClear = function () {
        local_storage_service_1.default.clear();
    };
    LocalStorageComponent.prototype.onRemove = function (item) {
        local_storage_service_1.default.delete(item.name);
    };
    LocalStorageComponent.meta = {
        selector: 'local-storage-component',
        template: "\n\t\t<div class=\"rxc-block\">\n\t\t\t<div class=\"rxc-head\">\n\t\t\t\t<span class=\"rxc-head__title\" (click)=\"onToggle()\">\n\t\t\t\t\t<span *if=\"!active\">+ localStorage</span>\n\t\t\t\t\t<span *if=\"active\">- localStorage</span>\n\t\t\t\t\t<span [innerHTML]=\"' {' + items.length + ')'\"></span>\n\t\t\t\t</span>\n\t\t\t\t<span class=\"rxc-head__remove\" (click)=\"onClear()\">x</span>\n\t\t\t</div>\n\t\t\t<ul class=\"rxc-list\" *if=\"active\">\n\t\t\t\t<li class=\"rxc-list__item\" *for=\"let item of items\">\n\t\t\t\t\t<span class=\"rxc-list__name\" [innerHTML]=\"item.name\"></span>\n\t\t\t\t\t<span class=\"rxc-list__value\" [innerHTML]=\"item.value | json\"></span>\n\t\t\t\t\t<span class=\"rxc-list__remove\" (click)=\"onRemove(item)\">x</span>\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</div>",
    };
    return LocalStorageComponent;
}(rxcomp_1.Component));
exports.default = LocalStorageComponent;
