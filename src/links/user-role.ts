import { defineLink } from "@medusajs/framework/utils";
import rbacModule from "../modules/rbac";
import userModule from "@medusajs/medusa/user";

export default defineLink(
  {
    linkable: userModule.linkable.user,
    isList: true,
  },
  rbacModule.linkable.rbacRole
);
