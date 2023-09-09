import { IAuthDecorator, MetadataKeys } from "../iHyperflow";

const Auth: IAuthDecorator = (strategy: string[]): ClassDecorator => {
  return (target) => {
    const key = MetadataKeys.AUTH_STRATEGIES;
    const strategies: string[] = Reflect.hasMetadata(key, target)
      ? Reflect.getMetadata(key, target)
      : [];
    strategies.push(...strategy);
    console.log(strategies, target.name);
    Reflect.defineMetadata(key, strategies, target);
  };
};
export default Auth;
