"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iHyperflow_1 = require("../iHyperflow");
const Controller = (basePath) => {
    return (target) => {
        Reflect.defineMetadata(iHyperflow_1.MetadataKeys.BASE_PATH, basePath, target);
    };
};
exports.default = Controller;
//# sourceMappingURL=controller.decorator.js.map