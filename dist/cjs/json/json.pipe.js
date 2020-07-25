"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var rxcomp_1 = require("rxcomp");
var JsonPipe = /** @class */ (function (_super) {
    tslib_1.__extends(JsonPipe, _super);
    function JsonPipe() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    JsonPipe.transform = function (value) {
        var cache = new Map();
        var json = JSON.stringify(value, function (key, value) {
            if (typeof value === 'object' && value != null) {
                if (cache.has(value)) {
                    // Circular reference found, discard key
                    return '#ref';
                }
                cache.set(value, true);
            }
            return value;
        }, 2);
        return json;
    };
    return JsonPipe;
}(rxcomp_1.Pipe));
exports.default = JsonPipe;
JsonPipe.meta = {
    name: 'json',
};
