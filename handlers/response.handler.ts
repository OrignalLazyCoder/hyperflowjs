import { Handler, NextFunction, Request, Response } from "express";
import {
  IClass,
  IDiContainer,
  MetadataKeys,
  RequestPayload,
} from "../iHyperflow";
import { File } from "buffer";

export const responseHandler =
  (
    handler: (...args) => any,
    classInstance: { [handleName: string]: Handler },
    controllerClass: IClass,
    diContainer: IDiContainer
  ) =>
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Get Auth Strategies
      const strategies: string[] = Reflect.getMetadata(
        MetadataKeys.AUTH_STRATEGIES,
        controllerClass
      );
      let isAllowed = true;
      if (strategies) {
        for (let strategy of strategies) {
          const authStrategy = diContainer.getAuthStrategy(strategy);
          if (authStrategy) {
            authStrategy.canActivate(request, response);
            if (response.headersSent) {
              isAllowed = false;
              break;
            }
          }
        }
      }
      if (!isAllowed) {
        return;
      }
      // Generate the unique key for meta data
      const getUniqueKey = (key: RequestPayload): string => {
        return `custom:${classInstance.constructor.name}.${
          handler.name.split(" ")[1] // Here function name will come as "bound function_name". So we just need function_name
        }.${key}`;
      };

      // Arguments for handler function
      let args = [];

      // Will be set to true only if the function requests "response" object
      let isResponseOverridden: boolean = false;

      // Add arguments to arg array
      const addArgs = (key: RequestPayload) => {
        // Extract index of a key in the calling function
        const idx = Reflect.getMetadata(getUniqueKey(key), classInstance);

        // If key is not defined, the idx will be undefined
        if (idx !== undefined) {
          let value = null;
          switch (key) {
            case RequestPayload.BODY:
              value = request.body;
              break;
            case RequestPayload.HEADER:
              value = request.headers;
              break;
            case RequestPayload.RESPONSE:
              isResponseOverridden = true;
              value = response;
              break;
            case RequestPayload.REQUEST:
              value = request;
              break;
            case RequestPayload.PARAM:
              value = request.params;
              break;
            case RequestPayload.QUERY:
              value = request.query;
              break;
            case RequestPayload.FILES:
              value = (request as any).files;
              break;
            case RequestPayload.FORM_DATA:
              value = { ...request.body } as any;
              break;
            default:
              console.error(`${key} as Decorator Key Not Supported Yet!`);
          }
          // if key is requested by the function, add it to the argument
          if (value) {
            args[idx] = value;
          }
        }
      };

      // Iterate all available Request keys
      Object.keys(RequestPayload).forEach((x) => {
        addArgs(RequestPayload[x]);
      });

      // If no custom keys are expected by the function, then send request object by default
      if (args.length === 0) {
        args = [request];
      }

      if (!isResponseOverridden) {
        // As request is not altered in the function, send response
        const result = await handler(...args);
        if (result) {
          if (typeof result === typeof File) {
            response.sendFile(result);
          } else {
            if (typeof result === "object" && "status" in result) {
              response.status(result.status);
              delete result.status;
            }
            if (typeof result === "object" && "data" in result) {
              response.send(result.data);
            } else {
              response.send(result);
            }
          }
        } else {
          response.send();
        }
      } else {
        // call handler
        handler(...args);
      }
    } catch (error) {
      console.error(error);
      response
        .status(error.statusCode || 500)
        .send(error.error || error.message || "");
    }
  };
