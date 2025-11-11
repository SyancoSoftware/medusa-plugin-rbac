import {
  StepResponse,
  WorkflowResponse,
  createStep,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk";

import { RBAC_MODULE } from "../modules/rbac";
import type RbacModuleService from "../modules/rbac/service";
import type { PermissionCategoryType } from "../modules/rbac/types";

type PermissionCategoryInput = {
  id?: string;
  name: string;
  type: PermissionCategoryType;
};

interface CreatePermissionCategoryStepInput {
  categories: PermissionCategoryInput[];
}

const stepCreate = createStep(
  "create",
  async (
    { categories }: CreatePermissionCategoryStepInput,
    context
  ): Promise<StepResponse<any[]>> => {
    const rbacModuleService =
      context.container.resolve<RbacModuleService>(RBAC_MODULE);
    const logger = context.container.resolve<any>("logger");

    const results =
      await rbacModuleService.listAndCountRbacPermissionCategories();

    logger.info(
      `Categorías actuales de permisos RBAC: ${JSON.stringify(results)}`
    );

    const categoriesToCreate = categories.filter((category) => {
      return !results[0].find((result: any) => result.name !== category.name);
    });

    logger.info(
      `Categorías de permisos RBAC para crear: ${JSON.stringify(
        categoriesToCreate
      )}`
    );

    const rbacPermissionCategories =
      await rbacModuleService.createRbacPermissionCategories(
        categoriesToCreate.map((category) => ({
          ...category,
          permissions: [],
        }))
      );

    if (rbacPermissionCategories) {
      if (categoriesToCreate.length < categories.length) {
        logger.info(
          `Se han creado categorías de permisos. Algunas de ellas ya existían.`
        );
      } else {
        logger.info(`Se han creado las categorías de permisos.`);
      }
    }

    return new StepResponse([
      ...(rbacPermissionCategories ?? []),
      ...(results[0] ?? []),
    ]);
  }
);

const createPermissionCategoryWorkflow = createWorkflow(
  "create-permission-category",
  (input: CreatePermissionCategoryStepInput) => {
    const result = stepCreate(input);
    return new WorkflowResponse(result);
  }
);

export default createPermissionCategoryWorkflow;
