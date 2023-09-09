"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iHyperflow_1 = require("../iHyperflow");
const Injectable = (scope) => {
    return (target) => {
        Reflect.defineMetadata(iHyperflow_1.MetadataKeys.DI_SCOPE, scope, target);
    };
};
exports.default = Injectable;
//# sourceMappingURL=injectable.decorator.js.map