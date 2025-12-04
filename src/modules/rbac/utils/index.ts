import { ActionType } from "../types";

export const convertApiMethodToRbacAction = (
  apiMethod: string
): ActionType | undefined => {
  switch (apiMethod.toUpperCase()) {
    case "GET":
      return ActionType.READ;
    case "POST":
    case "PUT":
    case "PATCH":
      return ActionType.WRITE;
    case "DELETE":
      return ActionType.DELETE;
    default:
      return undefined;
  }
};
