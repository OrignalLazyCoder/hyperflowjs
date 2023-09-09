"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormData = exports.Files = exports.Param = exports.Cookie = exports.Header = exports.Res = exports.Req = exports.Query = exports.Body = void 0;
const iHyperflow_1 = require("../iHyperflow");
const parameterDecoratorFactory = (key) => {
    return (target, methodName, position) => {
        const uniqueKey = `custom:${target.constructor.name}.${methodName}.${key}`;
        Reflect.defineMetadata(uniqueKey, position, target);
    };
};
exports.Body = parameterDecoratorFactory(iHyperflow_1.RequestPayload.BODY);
exports.Query = parameterDecoratorFactory(iHyperflow_1.RequestPayload.QUERY);
exports.Req = parameterDecoratorFactory(iHyperflow_1.RequestPayload.REQUEST);
exports.Res = parameterDecoratorFactory(iHyperflow_1.RequestPayload.RESPONSE);
exports.Header = parameterDecoratorFactory(iHyperflow_1.RequestPayload.HEADER);
exports.Cookie = parameterDecoratorFactory(iHyperflow_1.RequestPayload.COOKIE);
exports.Param = parameterDecoratorFactory(iHyperflow_1.RequestPayload.PARAM);
exports.Files = parameterDecoratorFactory(iHyperflow_1.RequestPayload.FILES);
exports.FormData = parameterDecoratorFactory(iHyperflow_1.RequestPayload.FORM_DATA);
//# sourceMappingURL=parameters.decorator.js.map