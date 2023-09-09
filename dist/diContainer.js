"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiContainer = void 0;
const iHyperflow_1 = require("./iHyperflow");
class Graph {
    constructor() {
        this.adjacencyList = new Map();
    }
    addVertex(vertex) {
        if (!this.adjacencyList.has(vertex)) {
            this.adjacencyList.set(vertex, []);
        }
    }
    addEdge(source, destination) {
        if (this.adjacencyList.has(source) && this.adjacencyList.has(destination)) {
            const edges = this.adjacencyList.get(source);
            edges.push(destination);
        }
    }
    hasCycle() {
        const visited = new Set();
        const recStack = new Set();
        for (const vertex of this.adjacencyList.keys()) {
            if (this.isCyclic(vertex, visited, recStack)) {
                return true;
            }
        }
        return false;
    }
    printGraph() {
        for (const [vertex, edges] of this.adjacencyList.entries()) {
            const edgeList = edges
                .map((destination) => `${vertex} -> ${destination}`)
                .join(", ");
            console.log(`${vertex}: ${edgeList}`);
        }
    }
    isCyclic(vertex, visited, recStack) {
        if (recStack.has(vertex)) {
            return true;
        }
        if (visited.has(vertex)) {
            return false;
        }
        visited.add(vertex);
        recStack.add(vertex);
        const neighbors = this.adjacencyList.get(vertex);
        for (const neighbor of neighbors) {
            if (this.isCyclic(neighbor, visited, recStack)) {
                return true;
            }
        }
        recStack.delete(vertex);
        return false;
    }
}
/**
 * Handler for Dependency injection in the application
 */
class DiContainer {
    constructor() {
        // Store key value mapping of request services
        this._dIRequestService = {};
        // Stores key value mapping of scoped services
        this._diScopedServices = {};
        // Stores key value mapping of singleton services
        this._diSingletonService = {};
        // Stores meta data for all services using @Injectable Decorator
        this._diServicesMetaData = {};
        // auth strategies
        this._diAuthStrategies = {};
        this._diGraph = new Graph();
    }
    /**
     *
     * @param key string value - unique identifier for a service
     * @param intiatedClass initated instance of the class that will be registered as singleton
     */
    addSingletonDi(key, intiatedClass) {
        this._diSingletonService[key] = intiatedClass;
    }
    /**
     *
     * @param key string value - unique identifier for a service
     * @param intiatedClass initated instance of the class that will be registered as singleton
     */
    addAuthService(service) {
        this._diAuthStrategies[service.key] = service.implementation;
        this._diSingletonService[service.name] = service.implementation;
    }
    getAuthStrategy(key) {
        if (this._diAuthStrategies[key]) {
            return this._diAuthStrategies[key];
        }
        else {
            console.error(`Strategy with key ${key} not defined}`);
        }
    }
    /**
     *
     * @param service Service that will be registered as scoped
     */
    addScopedDi(service) {
        this._diScopedServices[service.name] = service;
    }
    /**
     *
     * @param service Service that will be registered as request
     */
    addRequestDi(service) {
        this._dIRequestService[service.name] = service;
    }
    /**
     *
     * @param services Array of services that are registered in the application
     */
    registerServices(services) {
        services.forEach((service) => {
            // Get Dependency inject scope of the service
            const serviceScope = Reflect.getMetadata(iHyperflow_1.MetadataKeys.DI_SCOPE, service);
            // Get parameters of the service that are needed in constructor
            const serviceParameters = Reflect.getMetadata(iHyperflow_1.MetadataKeys.DI_INJECT_SCOPE, service);
            // check if service required DI parameters or not
            if (serviceParameters) {
                // Add index and name of classes required for the current class in constructor
                this._diServicesMetaData[service.name] = serviceParameters;
                this._diGraph.addVertex(service.name);
            }
            // If Scoped, then store class in Scoped Service
            if (serviceScope === iHyperflow_1.InjectableScope.SCOPED) {
                this._diScopedServices[service.name] = service;
            }
            // If singleton, iniate the service and store in Singleton services
            if (serviceScope === iHyperflow_1.InjectableScope.SINGLETON) {
                this._diSingletonService[service.name] = new service();
            }
        });
        // If cyclic dependency is found, terminate the application
        this.checkCyclicDependeny();
    }
    checkCyclicDependeny() {
        Object.keys(this._diServicesMetaData).forEach((serviceName) => {
            this._diServicesMetaData[serviceName].forEach((service) => {
                this._diGraph.addVertex(service.className);
                this._diGraph.addEdge(serviceName, service.className);
            });
        });
        if (this._diGraph.hasCycle()) {
            console.error("CYCLIC DEPENDENCIES FOUND!");
            console.error(this._diGraph.printGraph());
            process.exit(1);
        }
    }
    /**
     *
     * @param target Class being passed as parameters and index of position
     * @returns array of arguments of function service being initialized
     */
    getServiceDependencies(target) {
        // create empty array of arguments
        const args = [];
        // Get meta data of target class
        const serviceParameters = this._diServicesMetaData[target.className];
        // If meta data of target class is available then check for services that are being injected
        if (serviceParameters && serviceParameters.length) {
            serviceParameters.forEach((service) => {
                // if services is singleton, assign from mapping
                if (this._diSingletonService[service.className]) {
                    args[service.position] = this._diSingletonService[service.className];
                } // If service if scoped, check of dependencies and assign it
                else if (this._diScopedServices[service.className]) {
                    const innerServiceArgs = this.getServiceDependencies(service);
                    args[service.position] = new this._diScopedServices[service.className](...innerServiceArgs);
                }
            });
        }
        // return argument array
        return args;
    }
    // Get dependencies of a target class
    getDependencies(target) {
        const scopedService = Reflect.getMetadata(iHyperflow_1.MetadataKeys.DI_INJECT_SCOPE, target);
        // create empty array of arguments
        const diArgs = [];
        // if services are required by the function
        if (scopedService && scopedService.length) {
            scopedService.forEach((service) => {
                // if service is scoped, assign it
                if (this._diScopedServices[service.className]) {
                    // get dependencies of required service class
                    const args = this.getServiceDependencies(service);
                    diArgs[service.position] = new this._diScopedServices[service.className](...args);
                } // If service is singleton, assign it
                else if (this._diSingletonService[service.className]) {
                    diArgs[service.position] =
                        this._diSingletonService[service.className];
                }
            });
        }
        return diArgs;
    }
}
exports.DiContainer = DiContainer;
//# sourceMappingURL=diContainer.js.map