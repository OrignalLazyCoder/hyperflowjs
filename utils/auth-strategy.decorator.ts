import {
  IAuthStrategyDecorator,
  InjectableScope,
  MetadataKeys,
} from "../iHyperflow";

const AuthKey: IAuthStrategyDecorator = (strategy: string): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(MetadataKeys.AUTH_STRATEGIES, strategy, target);
    Reflect.defineMetadata(
      MetadataKeys.DI_SCOPE,
      InjectableScope.SINGLETON,
      target
    );
  };
};
export default AuthKey;
