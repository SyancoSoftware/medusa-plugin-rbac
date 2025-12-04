import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

import { RBAC_MODULE } from "../../../../modules/rbac";

export const GET = async (req: any, res: any) => {
  const userModuleService = req.scope.resolve(Modules.USER);
  const users = await userModuleService.listUsers();

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: rolesWithUsers,
  }: {
    data: Array<any>;
  } = await query.graph({
    entity: "rbac_role",
    fields: ["*", "users.*"],
  });

  const rbacModuleService = req.scope.resolve(RBAC_MODULE);
  const rbacRoles = await rbacModuleService.listRbacRoles(
    {},
    {
      relations: ["policies"],
    }
  );

  const rbacRolesToUser = rolesWithUsers.map((role: any) => {
    const rbacRoleFound = rbacRoles.find(
      (storedRole: any) => storedRole.id === role.id
    );

    return {
      role: {
        id: role.id,
        name: role.name,
        policies: rbacRoleFound ? rbacRoleFound.policies : [],
      },
      users: role.users,
    };
  });

  const usersToRbacRole: Array<{ user: any; role?: any }> = [];

  for (const user of users) {
    const rbacRoleToUserForUser = rbacRolesToUser.find((rbacRole) =>
      rbacRole.users.find((rbacUser: any) => rbacUser.id === user.id)
    );

    usersToRbacRole.push({
      user,
      role: rbacRoleToUserForUser ? rbacRoleToUserForUser.role : undefined,
    });
  }

  res.json(usersToRbacRole);
};
