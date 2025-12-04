import {
  StepResponse,
  WorkflowResponse,
  createStep,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk";

import { RBAC_MODULE } from "../modules/rbac";
import type RbacModuleService from "../modules/rbac/service";
import type { PolicyType } from "../modules/rbac/types";

type ReplaceRolePoliciesInput = {
  roleId: string;
  name: string;
  policies: Array<{
    permission: string | { id: string };
    type: PolicyType;
  }>;
};

const stepReplacePolicies = createStep(
  "replace-role-policies",
  async (
    input: ReplaceRolePoliciesInput,
    context
  ): Promise<StepResponse<void>> => {
    const rbacModuleService =
      context.container.resolve<RbacModuleService>(RBAC_MODULE);

    await rbacModuleService.updateRbacRoles({
      id: input.roleId,
      name: input.name,
    });

    const existingPolicies = await rbacModuleService.listRbacPolicies({
      role: input.roleId,
    });

    if (existingPolicies.length > 0) {
      await rbacModuleService.deleteRbacPolicies({
        id: existingPolicies.map((pol: any) => pol.id),
      });
    }

    const policiesToCreate = input.policies
      .map((policy) => ({
        role: input.roleId,
        permission: (policy.permission as any)?.id ?? policy.permission,
        type: policy.type,
      }))
      .filter((policy) => policy.permission);

    if (policiesToCreate.length > 0) {
      await rbacModuleService.createRbacPolicies(policiesToCreate);
    }

    return new StepResponse();
  }
);

const stepFetchRole = createStep(
  "fetch-role",
  async (
    { roleId }: { roleId: string },
    context
  ): Promise<StepResponse<any>> => {
    const rbacModuleService =
      context.container.resolve<RbacModuleService>(RBAC_MODULE);

    const role = await rbacModuleService.retrieveRbacRole(roleId, {
      relations: [
        "policies",
        "policies.permission",
        "policies.permission.category",
      ],
    });

    return new StepResponse(role);
  }
);

const replaceRolePoliciesWorkflow = createWorkflow(
  "replace-role-policies",
  (input: ReplaceRolePoliciesInput) => {
    stepReplacePolicies(input);
    const role = stepFetchRole({
      roleId: input.roleId,
    });

    return new WorkflowResponse({
      role,
    });
  }
);

export default replaceRolePoliciesWorkflow;
