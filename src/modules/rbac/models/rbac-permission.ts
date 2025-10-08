import { model } from "@medusajs/framework/utils";

import {
  ActionType,
  PermissionMatcherType,
  PermissionType,
} from "../types";
import RbacPolicy from "./rbac-policy";
import RbacPermissionCategory from "./rbac-permission-category";

const RbacPermission = model
  .define("rbac_permission", {
    id: model.id().primaryKey(),
    name: model.text(),
    type: model.enum(PermissionType),
    matcherType: model.enum(PermissionMatcherType),
    matcher: model.text(),
    actionType: model.enum(ActionType),
    policies: model.hasMany(() => RbacPolicy, {
      mappedBy: "permission",
    }),
    category: model
      .belongsTo(() => RbacPermissionCategory, {
        mappedBy: "permissions",
      })
      .nullable(),
  })
  .cascades({
    delete: ["policies"],
  });

export default RbacPermission;
