import { model } from "@medusajs/framework/utils";

import RbacPolicy from "./rbac-policy";

const RbacRole = model
  .define("rbac_role", {
    id: model.id().primaryKey(),
    name: model.text(),
    policies: model.hasMany(() => RbacPolicy, {
      mappedBy: "role",
    }),
  })
  .cascades({
    delete: ["policies"],
  });

export default RbacRole;
