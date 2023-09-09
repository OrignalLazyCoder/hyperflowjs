import { IControllerDecorator, MetadataKeys } from "../iHyperflow";

const Controller: IControllerDecorator = (basePath: string): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(MetadataKeys.BASE_PATH, basePath, target);
  };
};
export default Controller;
