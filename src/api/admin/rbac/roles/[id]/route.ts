import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";

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
  const roleId = req.params.id;
  const { name, policies } = req.body ?? {};

  if (!name) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "name es obligatorio"
    );
  }

  if (Array.isArray(policies)) {
    policies.forEach((policy: any) => {
      if (!policy.permission || !policy.type) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Cada politica necesita permission y type"
        );
      }
    });
  }

  if (name) {
    await rbacModuleService.updateRbacRoles({
      id: roleId,
      name,
    });
  }

  if (Array.isArray(policies)) {
    const existingPolicies =
      await rbacModuleService.listRbacPolicies({
        role: roleId,
      });

    if (existingPolicies.length > 0) {
      await rbacModuleService.deleteRbacPolicies({
        id: existingPolicies.map((pol: any) => pol.id),
      });
    }

    const policiesToCreate = policies
      .map((policy: any) => ({
        role: roleId,
        permission: policy.permission?.id ?? policy.permission,
        type: policy.type,
      }))
      .filter((policy: any) => policy.permission);

    if (policiesToCreate.length > 0) {
      await rbacModuleService.createRbacPolicies(policiesToCreate);
    }
  }

  const updatedRole = await rbacModuleService.retrieveRbacRole(roleId, {
    relations: [
      "policies",
      "policies.permission",
      "policies.permission.category",
    ],
  });

  res.json(updatedRole);
};
