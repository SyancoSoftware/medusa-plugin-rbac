import { ContainerRegistrationKeys } from "@medusajs/utils";
import { ExecArgs } from "@medusajs/framework/types"

import {
  ActionType,
  PermissionCategoryType,
  PermissionMatcherType,
  PermissionType,
} from "../modules/rbac/types";
import createPermissionCategoryWorkflow from "../workflows/create-permission-category";
import createPermissionsWorkflow from "../workflows/create-permissions";

const PREDEFINED_CATEGORIES = [
  {
    name: "Orders",
    type: PermissionCategoryType.PREDEFINED,
    permissions: [],
  },
  {
    name: "Products",
    type: PermissionCategoryType.PREDEFINED,
    permissions: [],
  },
  {
    name: "Customers",
    type: PermissionCategoryType.PREDEFINED,
    permissions: [],
  },
];

const PREDEFINED_PERMISSIONS_ORDERS = [
  {
    name: "READ Orders",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/orders",
    actionType: ActionType.READ,
    policies: [],
  },
  {
    name: "WRITE Orders",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/orders",
    actionType: ActionType.WRITE,
    policies: [],
  },
  {
    name: "DELETE Orders",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/orders",
    actionType: ActionType.DELETE,
    policies: [],
  },
];

const PREDEFINED_PERMISSIONS_PRODUCTS = [
  {
    name: "READ Products",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/products",
    actionType: ActionType.READ,
    policies: [],
  },
  {
    name: "WRITE Products",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/products",
    actionType: ActionType.WRITE,
    policies: [],
  },
  {
    name: "DELETE Products",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/products",
    actionType: ActionType.DELETE,
    policies: [],
  },
];

const PREDEFINED_PERMISSIONS_CUSTOMERS = [
  {
    name: "READ Customers",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/customers",
    actionType: ActionType.READ,
    policies: [],
  },
  {
    name: "WRITE Customers",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/customers",
    actionType: ActionType.WRITE,
    policies: [],
  },
  {
    name: "DELETE Customers",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/customers",
    actionType: ActionType.DELETE,
    policies: [],
  },
];

type SeedContext = {
  container: {
    resolve<T>(registration: string): T;
  };
};

export default async function seedRbacData({
  container,
}: ExecArgs): Promise<void> {
  const logger = container.resolve(
    ContainerRegistrationKeys.LOGGER
  );

  logger.info("Start seeding rbac permissions");

  await createPermissionCategoryWorkflow(container).run({
    input: {  
      categories: PREDEFINED_CATEGORIES,
    },
  });

  const permissionsToCreate = PREDEFINED_CATEGORIES.flatMap((category) => {
    switch (category.name) {
      case "Orders":
        return PREDEFINED_PERMISSIONS_ORDERS.map((permission) => ({
          ...permission,
          category: category.name,
        }));
      case "Products":
        return PREDEFINED_PERMISSIONS_PRODUCTS.map((permission) => ({
          ...permission,
          category: category.name,
        }));
      case "Customers":
        return PREDEFINED_PERMISSIONS_CUSTOMERS.map((permission) => ({
          ...permission,
          category: category.name,
        }));
      default:
        return [];
    }
  });

  await createPermissionsWorkflow(container).run({
    input: {
      permissions: permissionsToCreate.filter(
        (permission) =>
          permission !== undefined
      ),
    },
  });

  logger.info("Finished seeding rbac permissions");
}
