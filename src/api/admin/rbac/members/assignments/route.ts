import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

import assignRoleWorkflow from "../../../../../workflows/assign-role";

export const POST = async (req: any, res: any) => {
  const userModuleService = req.scope.resolve(Modules.USER);
  const user = await userModuleService.retrieveUser(req.body.userId);

  if (user) {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const {
      data: rolesWithUsers,
    }: { data: Array<any> } = await query.graph({
      entity: "rbac_role",
      fields: ["*", "users.*"],
    });

    const existingRole = rolesWithUsers.find((role: any) =>
      role.users.find((u: any) => u.id === req.body.userId)
    );

    await assignRoleWorkflow(req.scope).run({
      input: {
        oldRoleId:
          existingRole !== undefined ? existingRole.id : undefined,
        newRoleId: req.body.roleId,
        userId: req.body.userId,
      },
    });
  }

  res.json({});
};
