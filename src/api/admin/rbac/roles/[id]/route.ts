import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { RBAC_MODULE } from "../../../../../modules/rbac";

export const GET = async (req: any, res: any) => {
  const rbacModuleService = req.scope.resolve(RBAC_MODULE);
  const roleId = req.params.id;

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [roleWithUsers],
  }: {
    data: Array<any>;
  } = await query.graph({
    entity: "rbac_role",
    filters: {
      id: [roleId],
    },
    fields: ["*", "users.*"],
  });

  const role = await rbacModuleService.retrieveRbacRole(roleId, {
    relations: [
      "policies",
      "policies.permission",
      "policies.permission.category",
    ],
  });

  res.json({
    role,
    users: roleWithUsers.users,
  });
};

export const POST = async (req: any, res: any) => {
  const rbacModuleService = req.scope.resolve(RBAC_MODULE);
  const updatedRole = await rbacModuleService.updateRbacRoles({
    id: req.body.id,
    name: req.body.name,
  });

  res.json(updatedRole);
};
