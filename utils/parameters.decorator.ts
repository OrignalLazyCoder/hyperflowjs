import { RequestPayload } from "../iHyperflow";

const parameterDecoratorFactory = (key: RequestPayload) => {
  return (target: any, methodName: string, position: number): void => {
    const uniqueKey = `custom:${target.constructor.name}.${methodName}.${key}`;
    Reflect.defineMetadata(uniqueKey, position, target);
  };
};

export const Body = parameterDecoratorFactory(RequestPayload.BODY);
export const Query = parameterDecoratorFactory(RequestPayload.QUERY);
export const Req = parameterDecoratorFactory(RequestPayload.REQUEST);
export const Res = parameterDecoratorFactory(RequestPayload.RESPONSE);
export const Header = parameterDecoratorFactory(RequestPayload.HEADER);
export const Cookie = parameterDecoratorFactory(RequestPayload.COOKIE);
export const Param = parameterDecoratorFactory(RequestPayload.PARAM);
export const Files = parameterDecoratorFactory(RequestPayload.FILES);
export const FormData = parameterDecoratorFactory(RequestPayload.FORM_DATA);
