import { RBAC_MODULE } from "../../../../modules/rbac";

export const GET = async (req: any, res: any) => {
  const rbacModuleService = req.scope.resolve(RBAC_MODULE);
  const policies = await rbacModuleService.listRbacPolicies();
  res.json(policies);
};
