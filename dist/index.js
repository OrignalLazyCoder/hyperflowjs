"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const http = require("http");
const response_handler_1 = require("./handlers/response.handler");
const diContainer_1 = require("./diContainer");
const iHyperflow_1 = require("./iHyperflow");
class HyperFlow {
    get instance() {
        return this._instance;
    }
    constructor(config) {
        this._uploadConfig = multer({
            dest: "uploads/",
            limits: { fileSize: 1000000 },
        });
        this._multerFileKey = "files";
        this._instance = express();
        this._diContainer = new diContainer_1.DiContainer();
        this._instance.use(bodyParser.urlencoded({ extended: true }));
        this._instance.use(bodyParser.json());
        if (config) {
            this.setupApp(config);
        }
    }
    addMiddleware(service) {
        this._instance.use(service);
    }
    addMiddlewares(services) {
        services.forEach((service) => {
            this._instance.use(service);
        });
    }
    /**
     *
     * @param key string value - unique identifier for a service
     * @param value initated instance of the class that will be registered as singleton
     */
    addSingletonDi(service) {
        this._diContainer.addSingletonDi(service.key, service.implementation);
    }
    addSingletonsDi(services) {
        services.forEach((service) => {
            this._diContainer.addSingletonDi(service.key, service.implementation);
        });
    }
    /**
     *
     * @param service Service that will be registered as scoped
     */
    addScopedDi(service) {
        this._diContainer.addScopedDi(service);
    }
    /**
     *
     * @param service Service that will be registered as request
     */
    addRequestDi(service) {
        this._diContainer.addRequestDi(service);
    }
    /**
     *
     * @param services Array of services that are registered in the application
     */
    registerServices(services) {
        this._diContainer.registerServices(services);
    }
    /**
     *
     * @param services Array of auth services that are registered in the application
     */
    registerAuth(services) {
        services.forEach((service) => {
            this._diContainer.addAuthService(service);
        });
    }
    configMulter(config, key) {
        if (key) {
            this._multerFileKey = key;
        }
        this._uploadConfig = multer(config);
    }
    /**
     *
     * @param controllers Array of controllers to be registered
     */
    registerRouters(controllers) {
        // array of api path and handlers to log
        const info = [];
        // Iterate controllers defined in application
        controllers.forEach((controllerClass) => {
            // Get DI parameters of the controller
            const diArgs = this._diContainer.getDependencies(controllerClass);
            // Initialize controller with diArgs
            const controllerInstance = new controllerClass(...diArgs);
            // Get base path of the controller
            const basePath = Reflect.getMetadata(iHyperflow_1.MetadataKeys.BASE_PATH, controllerClass);
            // Get path of function defined in controller
            const routers = Reflect.getMetadata(iHyperflow_1.MetadataKeys.ROUTERS, controllerClass);
            // iterate all routes of function
            routers.forEach(({ method, path, handlerName }) => {
                // Assign end points to the application
                this._instance[method](`${basePath + path}`, this._uploadConfig.array(this._multerFileKey), (0, response_handler_1.responseHandler)(controllerInstance[String(handlerName)].bind(controllerInstance), controllerInstance, controllerClass, this._diContainer));
                info.push({
                    api: `${method.toLocaleUpperCase()} ${basePath + path}`,
                    handler: `${controllerClass.name}.${String(handlerName)}`,
                });
            });
        });
        // Log path and handlers
        // console.table(info);
    }
    setupApp(config) {
        this.addMiddlewares(config.middlewares);
        this.addSingletonsDi(config.singletonService);
        this.registerAuth(config.authStrategies);
        this.registerServices(config.scopedServices);
        this.registerRouters(config.controllers);
    }
    fireup(port) {
        // Create http servier
        const server = http.createServer(this._instance);
        // Start listening on provided port
        server.listen(port, () => {
            console.log(`Application is listening on :${port}`);
        });
    }
}
exports.default = HyperFlow;
//# sourceMappingURL=index.js.map