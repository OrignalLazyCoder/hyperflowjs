"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Put = exports.Delete = exports.Patch = exports.Post = exports.Get = void 0;
const iHyperflow_1 = require("../iHyperflow");
const methodDecoratorFactory = (method) => {
    return (path) => {
        return (target, propertyKey) => {
            const controllerClass = target.constructor;
            const routers = Reflect.hasMetadata(iHyperflow_1.MetadataKeys.ROUTERS, controllerClass)
                ? Reflect.getMetadata(iHyperflow_1.MetadataKeys.ROUTERS, controllerClass)
                : [];
            routers.push({
                method,
                path,
                handlerName: propertyKey,
            });
            Reflect.defineMetadata(iHyperflow_1.MetadataKeys.ROUTERS, routers, controllerClass);
        };
    };
};
exports.Get = methodDecoratorFactory(iHyperflow_1.Methods.GET);
exports.Post = methodDecoratorFactory(iHyperflow_1.Methods.POST);
exports.Patch = methodDecoratorFactory(iHyperflow_1.Methods.PATCH);
exports.Delete = methodDecoratorFactory(iHyperflow_1.Methods.DELETE);
exports.Put = methodDecoratorFactory(iHyperflow_1.Methods.PUT);
//# sourceMappingURL=handlers.decorator.js.map