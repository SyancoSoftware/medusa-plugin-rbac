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
};

interface CreatePermissionsStepInput {
  permissions: PermissionInput[];
}

const stepCreate = createStep(
  "create",
  async (
    { permissions }: CreatePermissionsStepInput,
    context
  ): Promise<StepResponse<string>> => {
    const rbacModuleService =
      context.container.resolve<RbacModuleService>(RBAC_MODULE);
    const logger = context.container.resolve<any>("logger");

    const results = await rbacModuleService.listRbacPermissions();
    logger.info(`Current rbac permissions: ${JSON.stringify(results)}`);

    const permissionsToCreate = permissions.filter((permission) => {
      return !results.find((result: any) => {
        return (
          result.matcher === permission.matcher &&
          result.matcherType === permission.matcherType &&
          result.actionType === permission.actionType
        );
      });
    });

    logger.info(
      `Rbac permissions to create: ${JSON.stringify(permissionsToCreate)}`
    );

    const rbacPermissions = await rbacModuleService.createRbacPermissions(
      permissionsToCreate.map((permission) => ({
        ...permission,
        policies: [],
      }))
    );

    if (rbacPermissions) {
      if (permissionsToCreate.length < permissions.length) {
        logger.info(
          `Permissions has been created. Some of them already existed.`
        );

        return new StepResponse(
          `Permissions has been created. Some of them already existed.`
        );
      }

      logger.info(`Permissions has been created.`);
      return new StepResponse(`Permissions has been created.`);
    }

    logger.info(`Permissions has NOT been created`);
    return new StepResponse(`Permissions has NOT been created`);
  }
);

const createPermissionsWorkflow = createWorkflow(
  "create-permissions",
  (input: CreatePermissionsStepInput) => {
    const result = stepCreate(input);
    return new WorkflowResponse({
      message: result,
    });
  }
);

export default createPermissionsWorkflow;
