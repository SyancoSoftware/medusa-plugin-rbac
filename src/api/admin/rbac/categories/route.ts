import { MedusaError } from "@medusajs/framework/utils";

import { RBAC_MODULE } from "../../../../modules/rbac";
import { PermissionCategoryType } from "../../../../modules/rbac/types";

export const GET = async (req: any, res: any) => {
  const rbacModuleService = req.scope.resolve(RBAC_MODULE);
  const type = req.query.type;
  const query = type ? { type } : {};

  const categories =
    await rbacModuleService.listRbacPermissionCategories(query, {
      relations: ["permissions"],
    });

  res.json(categories);
};

export const POST = async (req: any, res: any) => {
  const rbacModuleService = req.scope.resolve(RBAC_MODULE);
  const currentCategories =
    await rbacModuleService.listRbacPermissionCategories();

  if (
    currentCategories?.find(
      (category: any) => category.name === req.body.name
    )
  ) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "La categoría de permisos ya existe"
    );
  }

  const newCategory =
    await rbacModuleService.createRbacPermissionCategories({
      name: req.body.name,
      type: PermissionCategoryType.CUSTOM,
    });

  if (!newCategory) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Error al crear la categoría de permisos"
    );
  }

  res.json(newCategory);
};

export const DELETE = async (req: any, res: any) => {
  const rbacModuleService = req.scope.resolve(RBAC_MODULE);
  await rbacModuleService.deleteRbacPermissionCategories({
    id: req.body.id,
  });

  res.json({});
};
