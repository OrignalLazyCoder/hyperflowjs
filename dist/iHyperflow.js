"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthStrategy = exports.ResponseException = exports.ErrorMessageFormat = exports.Methods = exports.RequestPayload = exports.InjectableScope = exports.MetadataKeys = void 0;
var MetadataKeys;
(function (MetadataKeys) {
    MetadataKeys["BASE_PATH"] = "base_path";
    MetadataKeys["ROUTERS"] = "routers";
    MetadataKeys["DI_SCOPE"] = "scope";
    MetadataKeys["DI_INJECT_SCOPE"] = "inject_scope";
    MetadataKeys["AUTH_STRATEGIES"] = "auth_strategies";
})(MetadataKeys || (exports.MetadataKeys = MetadataKeys = {}));
var InjectableScope;
(function (InjectableScope) {
    InjectableScope["REQUEST"] = "request";
    InjectableScope["SCOPED"] = "scoped";
    InjectableScope["SINGLETON"] = "singleton";
})(InjectableScope || (exports.InjectableScope = InjectableScope = {}));
var RequestPayload;
(function (RequestPayload) {
    RequestPayload["BODY"] = "body";
    RequestPayload["QUERY"] = "query";
    RequestPayload["REQUEST"] = "request";
    RequestPayload["RESPONSE"] = "response";
    RequestPayload["HEADER"] = "header";
    RequestPayload["COOKIE"] = "cookie";
    RequestPayload["PARAM"] = "param";
    RequestPayload["FILES"] = "files";
    RequestPayload["FORM_DATA"] = "form_data";
})(RequestPayload || (exports.RequestPayload = RequestPayload = {}));
var Methods;
(function (Methods) {
    Methods["GET"] = "get";
    Methods["POST"] = "post";
    Methods["PATCH"] = "patch";
    Methods["DELETE"] = "delete";
    Methods["PUT"] = "put";
})(Methods || (exports.Methods = Methods = {}));
class ErrorMessageFormat {
}
exports.ErrorMessageFormat = ErrorMessageFormat;
class ResponseException extends Error {
    constructor() {
        super();
        Object.setPrototypeOf(this, ResponseException.prototype);
    }
}
exports.ResponseException = ResponseException;
class AuthStrategy {
    constructor() { }
}
exports.AuthStrategy = AuthStrategy;
//# sourceMappingURL=iHyperflow.js.map