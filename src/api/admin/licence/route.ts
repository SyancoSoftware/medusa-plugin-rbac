import {
  MedusaError,
  MedusaErrorTypes,
} from "@medusajs/utils";

import { RBAC_MODULE } from "../../../modules/rbac";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import RbacModuleService from "../../../modules/rbac/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const rbacModuleService: RbacModuleService = req.scope.resolve(RBAC_MODULE);

  try {
    const result = await rbacModuleService.checkLicence();

    res.status(200).json({
      licence: result,
    });
  } catch (error: any) {
    throw new MedusaError(
      MedusaErrorTypes.DB_ERROR,
      error.message ?? "Failed to check licence"
    );
  }
};
