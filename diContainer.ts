import {
  AuthStrategy,
  IAuthStrategies,
  IAuthStrategy,
  IClass,
  IDIParameters,
  IDiContainer,
  IService,
  InjectableScope,
  MetadataKeys,
} from "./iHyperflow";

class Graph<T> {
  private adjacencyList: Map<T, T[]>;

  constructor() {
    this.adjacencyList = new Map<T, T[]>();
  }

  addVertex(vertex: T) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(source: T, destination: T) {
    if (this.adjacencyList.has(source) && this.adjacencyList.has(destination)) {
      const edges = this.adjacencyList.get(source) as T[];
      edges.push(destination);
    }
  }

  hasCycle(): boolean {
    const visited: Set<T> = new Set<T>();
    const recStack: Set<T> = new Set<T>();

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

  private isCyclic(vertex: T, visited: Set<T>, recStack: Set<T>): boolean {
    if (recStack.has(vertex)) {
      return true;
    }

    if (visited.has(vertex)) {
      return false;
    }

    visited.add(vertex);
    recStack.add(vertex);

    const neighbors = this.adjacencyList.get(vertex) as T[];
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
export class DiContainer implements IDiContainer {
  // Store key value mapping of request services
  private _dIRequestService: any = {};

  // Stores key value mapping of scoped services
  private _diScopedServices: any = {};

  // Stores key value mapping of singleton services
  private _diSingletonService: any = {};

  // Stores meta data for all services using @Injectable Decorator
  private _diServicesMetaData: any = {};

  // auth strategies
  private _diAuthStrategies: any = {};

  private _diGraph: Graph<string>;

  constructor() {
    this._diGraph = new Graph<string>();
  }

  /**
   *
   * @param key string value - unique identifier for a service
   * @param intiatedClass initated instance of the class that will be registered as singleton
   */
  public addSingletonDi(key: string, intiatedClass: IService) {
    this._diSingletonService[key] = intiatedClass;
  }

  /**
   *
   * @param key string value - unique identifier for a service
   * @param intiatedClass initated instance of the class that will be registered as singleton
   */
  public addAuthService(service: IAuthStrategy) {
    this._diAuthStrategies[service.key] = service.implementation;
    this._diSingletonService[service.name] = service.implementation;
  }

  public getAuthStrategy(key: string): AuthStrategy {
    if (this._diAuthStrategies[key]) {
      return this._diAuthStrategies[key];
    } else {
      console.error(`Strategy with key ${key} not defined}`);
    }
  }

  /**
   *
   * @param service Service that will be registered as scoped
   */
  public addScopedDi(service: IService) {
    this._diScopedServices[service.name] = service;
  }

  /**
   *
   * @param service Service that will be registered as request
   */
  public addRequestDi(service: IService) {
    this._dIRequestService[service.name] = service;
  }

  /**
   *
   * @param services Array of services that are registered in the application
   */
  public registerServices(services: IService[]) {
    services.forEach((service) => {
      // Get Dependency inject scope of the service
      const serviceScope = Reflect.getMetadata(MetadataKeys.DI_SCOPE, service);
      // Get parameters of the service that are needed in constructor
      const serviceParameters = Reflect.getMetadata(
        MetadataKeys.DI_INJECT_SCOPE,
        service
      );

      // check if service required DI parameters or not
      if (serviceParameters) {
        // Add index and name of classes required for the current class in constructor
        this._diServicesMetaData[service.name] = serviceParameters;
        this._diGraph.addVertex(service.name);
      }
      // If Scoped, then store class in Scoped Service
      if (serviceScope === InjectableScope.SCOPED) {
        this._diScopedServices[service.name] = service;
      }
      // If singleton, iniate the service and store in Singleton services
      if (serviceScope === InjectableScope.SINGLETON) {
        this._diSingletonService[service.name] = new service();
      }
    });
    // If cyclic dependency is found, terminate the application
    this.checkCyclicDependeny();
  }

  private checkCyclicDependeny() {
    Object.keys(this._diServicesMetaData).forEach((serviceName: string) => {
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
  private getServiceDependencies(target: IDIParameters): any[] {
    // create empty array of arguments
    const args = [];

    // Get meta data of target class
    const serviceParameters: IDIParameters[] =
      this._diServicesMetaData[target.className];
    // If meta data of target class is available then check for services that are being injected
    if (serviceParameters && serviceParameters.length) {
      serviceParameters.forEach((service) => {
        // if services is singleton, assign from mapping
        if (this._diSingletonService[service.className]) {
          args[service.position] = this._diSingletonService[service.className];
        } // If service if scoped, check of dependencies and assign it
        else if (this._diScopedServices[service.className]) {
          const innerServiceArgs = this.getServiceDependencies(service);
          args[service.position] = new this._diScopedServices[
            service.className
          ](...innerServiceArgs);
        }
      });
    }
    // return argument array
    return args;
  }

  // Get dependencies of a target class
  public getDependencies(target: IClass): any[] {
    const scopedService: IDIParameters[] = Reflect.getMetadata(
      MetadataKeys.DI_INJECT_SCOPE,
      target
    );

    // create empty array of arguments
    const diArgs = [];

    // if services are required by the function
    if (scopedService && scopedService.length) {
      scopedService.forEach((service) => {
        // if service is scoped, assign it
        if (this._diScopedServices[service.className]) {
          // get dependencies of required service class
          const args = this.getServiceDependencies(service);
          diArgs[service.position] = new this._diScopedServices[
            service.className
          ](...args);
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
