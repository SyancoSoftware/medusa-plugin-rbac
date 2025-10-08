import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { RBAC_MODULE } from "../../../../modules/rbac";
import deleteRoleWorkflow from "../../../../workflows/delete-role";

export const GET = async (req: any, res: any) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: rolesWithUsers,
  }: {
    data: Array<any>;
  } = await query.graph({
    entity: "rbac_role",
    fields: [
      "*",
      "policies.*",
      "policies.permission.*",
      "users.*",
    ],
  });

  res.json(rolesWithUsers);
};

export const POST = async (req: any, res: any) => {
  const rbacModuleService = req.scope.resolve(RBAC_MODULE);
  const newRole = await rbacModuleService.addRole(req.body);
  res.json(newRole);
};

export const DELETE = async (req: any, res: any) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [roleWithUsers],
  }: {
    data: Array<any>;
  } = await query.graph({
    entity: "rbac_role",
    filters: {
      id: [req.body.id],
    },
    fields: ["*", "users.*"],
  });

  await deleteRoleWorkflow(req.scope).run({
    input: {
      roleId: req.body.id,
      impactedUserIds: roleWithUsers.users.map((user: any) => user.id),
    },
  });

  res.json({});
};
