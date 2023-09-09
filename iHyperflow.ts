import { Application, NextFunction, Request, Response } from "express";
import * as multer from "multer";
import { DataSource } from "typeorm";

export enum MetadataKeys {
  BASE_PATH = "base_path",
  ROUTERS = "routers",
  DI_SCOPE = "scope",
  DI_INJECT_SCOPE = "inject_scope",
  AUTH_STRATEGIES = "auth_strategies",
}

export enum InjectableScope {
  REQUEST = "request",
  SCOPED = "scoped",
  SINGLETON = "singleton",
}

export enum RequestPayload {
  BODY = "body",
  QUERY = "query",
  REQUEST = "request",
  RESPONSE = "response",
  HEADER = "header",
  COOKIE = "cookie",
  PARAM = "param",
  FILES = "files",
  FORM_DATA = "form_data",
}

export enum Methods {
  GET = "get",
  POST = "post",
  PATCH = "patch",
  DELETE = "delete",
  PUT = "put",
}

export class ErrorMessageFormat {
  message: string;
  field?: string;
}

export abstract class ResponseException extends Error {
  abstract statusCode: number;
  constructor() {
    super();
    Object.setPrototypeOf(this, ResponseException.prototype);
  }
  abstract formatErrors(): ErrorMessageFormat | ErrorMessageFormat[];
}

export abstract class AuthStrategy {
  constructor() {}
  abstract canActivate(request: Request, response: Response);
}

export interface IHyperFlow {
  get instance(): Application;
  setupApp(config: IApplicationConfig);
  addSingletonDi(service: ISingletonService);
  addScopedDi(service: IService);
  addRequestDi(service: IService);
  addMiddleware(service: IMiddleware);
  addMiddlewares(services: IMiddleware[]);
  configMulter(config: multer.Options, key?: string);
  registerRouters(controllers: IController[]);
  registerServices(services: IService[]);
  fireup(port: number);
}

export interface IDiContainer {
  addSingletonDi(key: string, intiatedClass: IService);
  addScopedDi(service: IService);
  addRequestDi(service: IService);
  registerServices(services: IService[]);
  getDependencies(target): IService[];
  getAuthStrategy(key: string): AuthStrategy;
}

export interface IRouter {
  method: Methods;
  path: string;
  handlerName: string | symbol;
}

export interface ITypeOrmConnection {
  get dataSource(): DataSource;
  connect(): Promise<number>;
}

export interface IDIParameters {
  className: string;
  position: number;
}

export type IInjectDecorator = (className: string) => ParameterDecorator;
export type IInjectableDecorator = (scope: InjectableScope) => ClassDecorator;
export type IParameterDecorator = (key: RequestPayload) => void;
export type IClass = { new (...args: any[]): any };
export type IService = IClass;
export type IController = IClass;
export type IAuthStrategy = {
  name: string;
  key: string;
  implementation: AuthStrategy;
};
export type ISingletonService = {
  key: string;
  implementation: any;
};
export type IAuthStrategies = IAuthStrategy[];
export type IControllerDecorator = (basePath: string) => ClassDecorator;
export type IAuthDecorator = (strategies: string[]) => ClassDecorator;
export type IAuthStrategyDecorator = (strategy: string) => ClassDecorator;
export type IMethodDecorator = (path: string) => MethodDecorator;
export type IMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => void;

export type IApplicationConfig = {
  controllers: IController[];
  scopedServices: IService[];
  singletonService: ISingletonService[];
  middlewares: IMiddleware[];
  authStrategies: IAuthStrategies;
};
