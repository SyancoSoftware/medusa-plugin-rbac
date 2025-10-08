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

  const updatedPermission = await rbacModuleService.updateRbacPermissions({
    id: req.body.id,
    name: req.body.name,
  });

  res.json(updatedPermission);
};
