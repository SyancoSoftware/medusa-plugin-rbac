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
      `Current rbac permissions categories: ${JSON.stringify(results)}`
    );

    const categoriesToCreate = categories.filter((category) => {
      return !results[0].find((result: any) => result.name !== category.name);
    });

    logger.info(
      `Rbac permissions categories to create: ${JSON.stringify(
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
          `Permissions categories has been created. Some of them already existed.`
        );
      } else {
        logger.info(`Permissions categories has been created.`);
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
