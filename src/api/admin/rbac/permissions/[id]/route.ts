import { MedusaError } from "@medusajs/framework/utils";

import { RBAC_MODULE } from "../../../../../modules/rbac";

export const GET = async (req: any, res: any) => {
  const rbacModuleService = req.scope.resolve(RBAC_MODULE);
  const permissionId = req.params.id;

  const permission = await rbacModuleService.retrieveRbacPermission(
    permissionId,
    {
      relations: ["category"],
    }
  );

  res.json({
    permission,
  });
};

export const POST = async (req: any, res: any) => {
  const rbacModuleService = req.scope.resolve(RBAC_MODULE);

  const permissionId = req.params.id;
  const {
    name,
    matcher,
    matcherType,
    actionType,
    type,
    category,
  } = req.body ?? {};

  if (!name || !matcher || !matcherType || !actionType) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "name, matcher, matcherType y actionType son obligatorios"
    );
  }

  if (matcher && matcherType && actionType) {
    const [existingPermissions] =
      await rbacModuleService.listAndCountRbacPermissions({
        matcher,
        matcherType,
        actionType,
      });

    const duplicate = existingPermissions.find(
      (perm: any) => perm.id !== permissionId
    );

    if (duplicate) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Ya existe un permiso con el mismo matcher y accion"
      );
    }
  }

  let categoryId: string | null | undefined = undefined;
  if (category !== undefined) {
    if (category === null || category === "None") {
      categoryId = null;
    } else {
      categoryId = category?.id ?? category;
    }
  }

  if (categoryId) {
    await rbacModuleService.retrieveRbacPermissionCategory(categoryId);
  }

  await rbacModuleService.updateRbacPermissions({
    id: permissionId,
    name,
    matcher,
    matcherType,
    actionType,
    type,
    category: categoryId,
  });

  const updatedPermission = await rbacModuleService.retrieveRbacPermission(
    permissionId,
    {
      relations: ["category"],
    }
  );

  res.json(updatedPermission);
};
