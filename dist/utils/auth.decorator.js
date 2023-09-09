"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iHyperflow_1 = require("../iHyperflow");
const Auth = (strategy) => {
    return (target) => {
        const key = iHyperflow_1.MetadataKeys.AUTH_STRATEGIES;
        const strategies = Reflect.hasMetadata(key, target)
            ? Reflect.getMetadata(key, target)
            : [];
        strategies.push(...strategy);
        console.log(strategies, target.name);
        Reflect.defineMetadata(key, strategies, target);
    };
};
exports.default = Auth;
//# sourceMappingURL=auth.decorator.js.map