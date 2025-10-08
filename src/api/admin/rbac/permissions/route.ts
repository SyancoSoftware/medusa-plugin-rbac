import { MedusaError } from "@medusajs/framework/utils";

import { RBAC_MODULE } from "../../../../modules/rbac";
import createPermissionWorkflow from "../../../../workflows/create-permission";

export const GET = async (req: any, res: any) => {
  const rbacModuleService = req.scope.resolve(RBAC_MODULE);
  const type = req.query.type;
  const query = type ? { type } : {};

  const permissions = await rbacModuleService.listRbacPermissions(query, {
    relations: ["policies", "category"],
  });

  res.json(permissions);
};

export const POST = async (req: any, res: any) => {
  const { result } = await createPermissionWorkflow(req.scope).run({
    input: {
      permission: req.body,
    },
  });

  if (result.permission) {
    res.json(result);
    return;
  }

  throw new MedusaError(
    MedusaError.Types.NOT_ALLOWED,
    "Permission already exists"
  );
};

export const DELETE = async (req: any, res: any) => {
  const rbacModuleService = req.scope.resolve(RBAC_MODULE);
  await rbacModuleService.deleteRbacPermissions({
    id: req.body.id,
  });

  res.json({});
};
