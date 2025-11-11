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
import { RBAC_MODULE } from "../modules/rbac";
import type RbacModuleService from "../modules/rbac/service";

const PREDEFINED_CATEGORIES = [
  {
    name: "Pedidos",
    type: PermissionCategoryType.PREDEFINED,
    permissions: [],
  },
  {
    name: "Productos",
    type: PermissionCategoryType.PREDEFINED,
    permissions: [],
  },
  {
    name: "Clientes",
    type: PermissionCategoryType.PREDEFINED,
    permissions: [],
  },
];

const PREDEFINED_PERMISSIONS_ORDERS = [
  {
    name: "Listar pedidos",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/orders",
    actionType: ActionType.READ,
    policies: [],
  },
  {
    name: "Modificar/Crear pedidos",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/orders",
    actionType: ActionType.WRITE,
    policies: [],
  },
  {
    name: "Eliminar pedidos",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/orders",
    actionType: ActionType.DELETE,
    policies: [],
  },
];

const PREDEFINED_PERMISSIONS_PRODUCTS = [
  {
    name: "Listar productos",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/products",
    actionType: ActionType.READ,
    policies: [],
  },
  {
    name: "Crear/Modificar productos",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/products",
    actionType: ActionType.WRITE,
    policies: [],
  },
  {
    name: "Eliminar productos",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/products",
    actionType: ActionType.DELETE,
    policies: [],
  },
];

const PREDEFINED_PERMISSIONS_CUSTOMERS = [
  {
    name: "Listar clientes",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/customers",
    actionType: ActionType.READ,
    policies: [],
  },
  {
    name: "Crear/Modificar clientes",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/customers",
    actionType: ActionType.WRITE,
    policies: [],
  },
  {
    name: "Eliminar clientes",
    type: PermissionType.PREDEFINED,
    matcherType: PermissionMatcherType.API,
    matcher: "/admin/customers",
    actionType: ActionType.DELETE,
    policies: [],
  },
];

export default async function seedRbacData({
  container,
}: ExecArgs): Promise<void> {
  const logger = container.resolve(
    ContainerRegistrationKeys.LOGGER
  );
  
  logger.info("Comienza a asignar permisos rbac");
  
  // Crear categorías
  await createPermissionCategoryWorkflow(container).run({
    input: {  
      categories: PREDEFINED_CATEGORIES,
    },
  });
  
  // ✅ NUEVO: Obtener las categorías con sus IDs
  const rbacModuleService = container.resolve<RbacModuleService>(RBAC_MODULE);
  const categories = await rbacModuleService.listRbacPermissionCategories();
  
  // Crear un mapa de nombre -> ID
  const categoryMap = new Map(
    categories.map((cat: any) => [cat.name, cat.id])
  );
  
  logger.info(`Mapa de categorías: ${JSON.stringify(Object.fromEntries(categoryMap))}`);
  
  // Crear permisos con los IDs correctos
  const permissionsToCreate = PREDEFINED_CATEGORIES.flatMap((category) => {
    const categoryId = categoryMap.get(category.name);
    
    if (!categoryId) {
      logger.warn(`No se encontró el ID para la categoría: ${category.name}`);
      return [];
    }
    
    switch (category.name) {
      case "Pedidos":
        return PREDEFINED_PERMISSIONS_ORDERS.map((permission) => ({
          ...permission,
          category_id: categoryId, // ✅ Usar category_id con el ID real
        }));
      case "Productos":
        return PREDEFINED_PERMISSIONS_PRODUCTS.map((permission) => ({
          ...permission,
          category_id: categoryId, // ✅ Usar category_id con el ID real
        }));
      case "Clientes":
        return PREDEFINED_PERMISSIONS_CUSTOMERS.map((permission) => ({
          ...permission,
          category_id: categoryId, // ✅ Usar category_id con el ID real
        }));
      default:
        return [];
    }
  });
  
  await createPermissionsWorkflow(container).run({
    input: {
      permissions: permissionsToCreate.filter(
        (permission) => permission !== undefined
      ),
    },
  });
  
  logger.info("Finalizada la configuración de los permisos rbac");
}