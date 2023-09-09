import "reflect-metadata";

import { Application, Handler } from "express";
import * as express from "express";
import * as multer from "multer";
import * as bodyParser from "body-parser";
import * as http from "http";
import { responseHandler } from "./handlers/response.handler";
import { DiContainer } from "./diContainer";
import {
  IApplicationConfig,
  IAuthStrategies,
  IClass,
  IController,
  IHyperFlow,
  IMiddleware,
  IRouter,
  IService,
  ISingletonService,
  MetadataKeys,
} from "./iHyperflow";

class HyperFlow implements IHyperFlow {
  private readonly _instance: Application;
  private readonly _diContainer: DiContainer;
  private _uploadConfig: any = multer({
    dest: "uploads/",
    limits: { fileSize: 1000000 },
  });
  private _multerFileKey: string = "files";

  get instance(): Application {
    return this._instance;
  }

  constructor(config?: IApplicationConfig | null) {
    this._instance = express();
    this._diContainer = new DiContainer();
    this._instance.use(bodyParser.urlencoded({ extended: true }));
    this._instance.use(bodyParser.json());
    if (config) {
      this.setupApp(config);
    }
  }

  addMiddleware(service: IMiddleware) {
    this._instance.use(service);
  }

  addMiddlewares(services: IMiddleware[]) {
    services.forEach((service) => {
      this._instance.use(service);
    });
  }

  /**
   *
   * @param key string value - unique identifier for a service
   * @param value initated instance of the class that will be registered as singleton
   */
  public addSingletonDi(service: ISingletonService) {
    this._diContainer.addSingletonDi(service.key, service.implementation);
  }

  private addSingletonsDi(services: ISingletonService[]) {
    services.forEach((service) => {
      this._diContainer.addSingletonDi(service.key, service.implementation);
    });
  }

  /**
   *
   * @param service Service that will be registered as scoped
   */
  public addScopedDi(service: IService) {
    this._diContainer.addScopedDi(service);
  }

  /**
   *
   * @param service Service that will be registered as request
   */
  public addRequestDi(service: IService) {
    this._diContainer.addRequestDi(service);
  }

  /**
   *
   * @param services Array of services that are registered in the application
   */
  public registerServices(services: IService[]) {
    this._diContainer.registerServices(services);
  }

  /**
   *
   * @param services Array of auth services that are registered in the application
   */
  public registerAuth(services: IAuthStrategies) {
    services.forEach((service) => {
      this._diContainer.addAuthService(service);
    });
  }

  public configMulter(config: multer.Options, key?: string) {
    if (key) {
      this._multerFileKey = key;
    }
    this._uploadConfig = multer(config);
  }

  /**
   *
   * @param controllers Array of controllers to be registered
   */
  public registerRouters(controllers: IController[]) {
    // array of api path and handlers to log
    const info: Array<{ api: string; handler: string }> = [];

    // Iterate controllers defined in application
    controllers.forEach((controllerClass) => {
      // Get DI parameters of the controller
      const diArgs = this._diContainer.getDependencies(controllerClass);

      // Initialize controller with diArgs
      const controllerInstance: { [handleName: string]: Handler } =
        new controllerClass(...diArgs) as any;

      // Get base path of the controller
      const basePath: string = Reflect.getMetadata(
        MetadataKeys.BASE_PATH,
        controllerClass
      );

      // Get path of function defined in controller
      const routers: IRouter[] = Reflect.getMetadata(
        MetadataKeys.ROUTERS,
        controllerClass
      );

      // iterate all routes of function
      routers.forEach(({ method, path, handlerName }) => {
        // Assign end points to the application
        this._instance[method](
          `${basePath + path}`,
          this._uploadConfig.array(this._multerFileKey),
          responseHandler(
            controllerInstance[String(handlerName)].bind(controllerInstance),
            controllerInstance,
            controllerClass,
            this._diContainer
          )
        );

        info.push({
          api: `${method.toLocaleUpperCase()} ${basePath + path}`,
          handler: `${controllerClass.name}.${String(handlerName)}`,
        });
      });
    });

    // Log path and handlers
    // console.table(info);
  }

  public setupApp(config: IApplicationConfig) {
    this.addMiddlewares(config.middlewares);
    this.addSingletonsDi(config.singletonService);
    this.registerAuth(config.authStrategies);
    this.registerServices(config.scopedServices);
    this.registerRouters(config.controllers);
  }

  public fireup(port: number) {
    // Create http servier
    const server = http.createServer(this._instance);
    // Start listening on provided port
    server.listen(port, () => {
      console.log(`Application is listening on :${port}`);
    });
  }
}
export default HyperFlow;
