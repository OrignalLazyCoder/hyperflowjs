import {
  IMethodDecorator,
  IRouter,
  MetadataKeys,
  Methods,
} from "../iHyperflow";

const methodDecoratorFactory = (method: Methods) => {
  return (path: string): MethodDecorator => {
    return (target, propertyKey) => {
      const controllerClass = target.constructor;
      const routers: IRouter[] = Reflect.hasMetadata(
        MetadataKeys.ROUTERS,
        controllerClass
      )
        ? Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass)
        : [];
      routers.push({
        method,
        path,
        handlerName: propertyKey,
      });
      Reflect.defineMetadata(MetadataKeys.ROUTERS, routers, controllerClass);
    };
  };
};
export const Get: IMethodDecorator = methodDecoratorFactory(Methods.GET);
export const Post: IMethodDecorator = methodDecoratorFactory(Methods.POST);
export const Patch: IMethodDecorator = methodDecoratorFactory(Methods.PATCH);
export const Delete: IMethodDecorator = methodDecoratorFactory(Methods.DELETE);
export const Put: IMethodDecorator = methodDecoratorFactory(Methods.PUT);
