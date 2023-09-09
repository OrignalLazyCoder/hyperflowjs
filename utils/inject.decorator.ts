import { IDIParameters, IInjectDecorator, MetadataKeys } from "../iHyperflow";

const injectDecoratorFactory = (className: string): ParameterDecorator => {
  return (target: any, methodName: string, position: number): void => {
    const services: IDIParameters[] = Reflect.hasMetadata(
      MetadataKeys.DI_INJECT_SCOPE,
      target
    )
      ? Reflect.getMetadata(MetadataKeys.DI_INJECT_SCOPE, target)
      : [];
    services.push({
      className: className,
      position: position,
    });
    Reflect.defineMetadata(MetadataKeys.DI_INJECT_SCOPE, services, target);
  };
};

export const Inject: IInjectDecorator = (className: string) =>
  injectDecoratorFactory(className);
