import { model } from "@medusajs/framework/utils";

import { PolicyType } from "../types";
import RbacPermission from "./rbac-permission";
import RbacRole from "./rbac-role";

const RbacPolicy = model.define("rbac_policy", {
  id: model.id().primaryKey(),
  type: model.enum(PolicyType),
  permission: model.belongsTo(() => RbacPermission, {
    mappedBy: "policies",
  }),
  role: model.belongsTo(() => RbacRole, {
    mappedBy: "policies",
  }),
});

export default RbacPolicy;
