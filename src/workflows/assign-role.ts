import {
  WorkflowResponse,
  createWorkflow,
  when,
} from "@medusajs/framework/workflows-sdk";
import {
  createRemoteLinkStep,
  dismissRemoteLinkStep,
} from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";

import { RBAC_MODULE } from "../modules/rbac";

interface AssignRoleInput {
  userId: string;
  oldRoleId?: string;
  newRoleId: string;
}

const assignRoleToUserWorkflow = createWorkflow(
  "assign-role-to-user",
  (input: AssignRoleInput) => {
    when(input, (currentInput) => currentInput.oldRoleId !== undefined).then(
      () => {
        dismissRemoteLinkStep([
          {
            [Modules.USER]: {
              user_id: input.userId,
            },
            [RBAC_MODULE]: {
              rbac_role_id: input.oldRoleId,
            },
          },
        ]);
      }
    );

    createRemoteLinkStep([
      {
        [Modules.USER]: {
          user_id: input.userId,
        },
        [RBAC_MODULE]: {
          rbac_role_id: input.newRoleId,
        },
      },
    ]);

    return new WorkflowResponse({});
  }
);

export default assignRoleToUserWorkflow;
