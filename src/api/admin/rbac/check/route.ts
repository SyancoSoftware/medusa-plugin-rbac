import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { RBAC_MODULE } from "./../../../../modules/rbac";
import { PermissionMatcherType } from "./../../../..//modules/rbac/types";

export const POST = async (req: any, res: any) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: rolesWithUsers,
  }: { data: Array<any> } = await query.graph({
    entity: "rbac_role",
    fields: ["*", "users.*"],
  });

  const actorId = req.session?.auth_context?.actor_id;

  if (actorId) {
    const existingRole = rolesWithUsers.find((role: any) =>
      role.users.find((user: any) => user.id === actorId)
    );

    if (existingRole) {
      const rbacModuleService = req.scope.resolve(RBAC_MODULE);
      const authorizationResponse = {
        ...(await rbacModuleService.testAuthorization(
          existingRole,
          PermissionMatcherType.API,
          req.body.urlToTest
        )),
        actorId,
      };

      return res.json(authorizationResponse);
    }

    return res.json({
      actorId,
      url: req.body.urlToTest,
      allowed: [],
      denied: [],
    });
  }

  return res.json({
    actorId: undefined,
    url: req.body.urlToTest,
    allowed: [],
    denied: [],
  });
};
