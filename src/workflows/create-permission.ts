import {
  StepResponse,
  WorkflowResponse,
  createStep,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk";

import { RBAC_MODULE } from "../modules/rbac";
import type RbacModuleService from "../modules/rbac/service";
import type {
  ActionType,
  PermissionMatcherType,
  PermissionType,
} from "../modules/rbac/types";

type PermissionInput = {
  id?: string;
  name: string;
  matcher: string;
  matcherType: PermissionMatcherType;
  actionType: ActionType;
  type: PermissionType;
  category?: { id: string };
};

interface CreatePermissionStepInput {
  permission: PermissionInput;
}

const stepCreate = createStep(
  "create",
  async (
    { permission }: CreatePermissionStepInput,
    context
  ): Promise<StepResponse<any>> => {
    const rbacModuleService =
      context.container.resolve<RbacModuleService>(RBAC_MODULE);
    const logger = context.container.resolve<any>("logger");

    const results = await rbacModuleService.listAndCountRbacPermissions();
    const isPermissionExists = results[0].find((result: any) => {
      return (
        result.matcher === permission.matcher &&
        result.matcherType === permission.matcherType &&
        result.actionType === permission.actionType
      );
    });

    if (isPermissionExists) {
      logger.error(`El permiso NO se ha creado. Ya existe.`);
      return new StepResponse(undefined);
    }

    logger.info(`Permiso RBAC para crear: ${JSON.stringify(permission)}`);

    const rbacPermission = await rbacModuleService.createRbacPermissions({
      ...permission,
      policies: [],
      category: permission.category?.id,
    });

    if (rbacPermission) {
      return new StepResponse(rbacPermission);
    }

    logger.error(`No se ha creado el permiso.`);
    return new StepResponse(undefined);
  }
);

const createPermissionWorkflow = createWorkflow(
  "create-permission",
  (input: CreatePermissionStepInput) => {
    const result = stepCreate(input);
    return new WorkflowResponse({
      permission: result,
    });
  }
);

export default createPermissionWorkflow;
