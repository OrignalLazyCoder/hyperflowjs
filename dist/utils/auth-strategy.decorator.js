"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iHyperflow_1 = require("../iHyperflow");
const AuthKey = (strategy) => {
    return (target) => {
        Reflect.defineMetadata(iHyperflow_1.MetadataKeys.AUTH_STRATEGIES, strategy, target);
        Reflect.defineMetadata(iHyperflow_1.MetadataKeys.DI_SCOPE, iHyperflow_1.InjectableScope.SINGLETON, target);
    };
};
exports.default = AuthKey;
//# sourceMappingURL=auth-strategy.decorator.js.map