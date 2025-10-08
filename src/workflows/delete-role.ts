import {
  StepResponse,
  WorkflowResponse,
  createStep,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk";
import { dismissRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";

import { RBAC_MODULE } from "../modules/rbac";
import type RbacModuleService from "../modules/rbac/service";

interface DeleteRoleInput {
  roleId: string;
  impactedUserIds: string[];
}

const stepDeleteRole = createStep(
  "delete-role",
  async (
    { roleId }: { roleId: string },
    context
  ): Promise<StepResponse<string>> => {
    const rbacModuleService =
      context.container.resolve<RbacModuleService>(RBAC_MODULE);

    await rbacModuleService.deleteRbacRoles({
      id: roleId,
    });

    return new StepResponse(`Role has been deleted`);
  }
);

const deleteRoleWorkflow = createWorkflow(
  "delete-role",
  (input: DeleteRoleInput) => {
    const linksToDismiss = transform({ input }, (data) =>
      data.input.impactedUserIds.map((userId) => ({
        [Modules.USER]: {
          user_id: userId,
        },
        rbacModuleService: {
          rbac_role_id: data.input.roleId,
        },
      }))
    );

    dismissRemoteLinkStep(linksToDismiss);
    stepDeleteRole(input);

    return new WorkflowResponse({});
  }
);

export default deleteRoleWorkflow;
