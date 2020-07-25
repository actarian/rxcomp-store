"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var rxcomp_1 = require("rxcomp");
var cookie_storage_component_1 = tslib_1.__importDefault(require("./storage/cookie-storage.component"));
var local_storage_component_1 = tslib_1.__importDefault(require("./storage/local-storage.component"));
var session_storage_component_1 = tslib_1.__importDefault(require("./storage/session-storage.component"));
var factories = [
    cookie_storage_component_1.default,
    local_storage_component_1.default,
    session_storage_component_1.default,
];
var pipes = [];
/**
 * StoreModule Class.
 * @example
 * export default class AppModule extends Module {}
 *
 * AppModule.meta = {
 *  imports: [
 *   CoreModule,
 *   StoreModule
 *  ],
 *  declarations: [
 *   ErrorsComponent
 *  ],
 *  bootstrap: AppComponent,
 * };
 * @extends Module
 */
var StoreModule = /** @class */ (function (_super) {
    tslib_1.__extends(StoreModule, _super);
    function StoreModule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StoreModule.meta = {
        declarations: tslib_1.__spreadArrays(factories, pipes),
        exports: tslib_1.__spreadArrays(factories, pipes)
    };
    return StoreModule;
}(rxcomp_1.Module));
exports.default = StoreModule;
