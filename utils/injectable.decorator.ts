import {
  IInjectableDecorator,
  InjectableScope,
  MetadataKeys,
} from "../iHyperflow";

const Injectable: IInjectableDecorator = (
  scope: InjectableScope
): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(MetadataKeys.DI_SCOPE, scope, target);
  };
};
export default Injectable;
