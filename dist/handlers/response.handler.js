"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseHandler = void 0;
const iHyperflow_1 = require("../iHyperflow");
const buffer_1 = require("buffer");
const responseHandler = (handler, classInstance, controllerClass, diContainer) => (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get Auth Strategies
        const strategies = Reflect.getMetadata(iHyperflow_1.MetadataKeys.AUTH_STRATEGIES, controllerClass);
        let isAllowed = true;
        if (strategies) {
            for (let strategy of strategies) {
                const authStrategy = diContainer.getAuthStrategy(strategy);
                if (authStrategy) {
                    authStrategy.canActivate(request, response);
                    if (response.headersSent) {
                        isAllowed = false;
                        break;
                    }
                }
            }
        }
        if (!isAllowed) {
            return;
        }
        // Generate the unique key for meta data
        const getUniqueKey = (key) => {
            return `custom:${classInstance.constructor.name}.${handler.name.split(" ")[1] // Here function name will come as "bound function_name". So we just need function_name
            }.${key}`;
        };
        // Arguments for handler function
        let args = [];
        // Will be set to true only if the function requests "response" object
        let isResponseOverridden = false;
        // Add arguments to arg array
        const addArgs = (key) => {
            // Extract index of a key in the calling function
            const idx = Reflect.getMetadata(getUniqueKey(key), classInstance);
            // If key is not defined, the idx will be undefined
            if (idx !== undefined) {
                let value = null;
                switch (key) {
                    case iHyperflow_1.RequestPayload.BODY:
                        value = request.body;
                        break;
                    case iHyperflow_1.RequestPayload.HEADER:
                        value = request.headers;
                        break;
                    case iHyperflow_1.RequestPayload.RESPONSE:
                        isResponseOverridden = true;
                        value = response;
                        break;
                    case iHyperflow_1.RequestPayload.REQUEST:
                        value = request;
                        break;
                    case iHyperflow_1.RequestPayload.PARAM:
                        value = request.params;
                        break;
                    case iHyperflow_1.RequestPayload.QUERY:
                        value = request.query;
                        break;
                    case iHyperflow_1.RequestPayload.FILES:
                        value = request.files;
                        break;
                    case iHyperflow_1.RequestPayload.FORM_DATA:
                        value = Object.assign({}, request.body);
                        break;
                    default:
                        console.error(`${key} as Decorator Key Not Supported Yet!`);
                }
                // if key is requested by the function, add it to the argument
                if (value) {
                    args[idx] = value;
                }
            }
        };
        // Iterate all available Request keys
        Object.keys(iHyperflow_1.RequestPayload).forEach((x) => {
            addArgs(iHyperflow_1.RequestPayload[x]);
        });
        // If no custom keys are expected by the function, then send request object by default
        if (args.length === 0) {
            args = [request];
        }
        if (!isResponseOverridden) {
            // As request is not altered in the function, send response
            const result = yield handler(...args);
            if (result) {
                if (typeof result === typeof buffer_1.File) {
                    response.sendFile(result);
                }
                else {
                    if (typeof result === "object" && "status" in result) {
                        response.status(result.status);
                        delete result.status;
                    }
                    if (typeof result === "object" && "data" in result) {
                        response.send(result.data);
                    }
                    else {
                        response.send(result);
                    }
                }
            }
            else {
                response.send();
            }
        }
        else {
            // call handler
            handler(...args);
        }
    }
    catch (error) {
        console.error(error);
        response
            .status(error.statusCode || 500)
            .send(error.error || error.message || "");
    }
});
exports.responseHandler = responseHandler;
//# sourceMappingURL=response.handler.js.map