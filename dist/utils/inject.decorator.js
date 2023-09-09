"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inject = void 0;
const iHyperflow_1 = require("../iHyperflow");
const injectDecoratorFactory = (className) => {
    return (target, methodName, position) => {
        const services = Reflect.hasMetadata(iHyperflow_1.MetadataKeys.DI_INJECT_SCOPE, target)
            ? Reflect.getMetadata(iHyperflow_1.MetadataKeys.DI_INJECT_SCOPE, target)
            : [];
        services.push({
            className: className,
            position: position,
        });
        Reflect.defineMetadata(iHyperflow_1.MetadataKeys.DI_INJECT_SCOPE, services, target);
    };
};
const Inject = (className) => injectDecoratorFactory(className);
exports.Inject = Inject;
//# sourceMappingURL=inject.decorator.js.map