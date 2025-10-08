import { Button } from "@medusajs/ui";
import { Link } from "react-router-dom";

export enum PermissionType {
  PREDEFINED = "predefined",
  CUSTOM = "custom",
}

export enum PermissionMatcherType {
  API = "api",
}

export enum PermissionActionType {
  READ = "read",
  WRITE = "write",
  DELETE = "delete",
}

export enum AdminRbacPolicyType {
  DENY = "deny",
  ALLOW = "allow",
}

export type Nullable<T> = T | null | undefined;

export type ApiUser = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
};

export type RbacPermissionCategory = {
  id: string;
  name: string;
  type: PermissionType;
  permissions?: RbacPermission[];
};

export type RbacPermission = {
  id: string;
  name: string;
  matcher: string;
  matcherType: PermissionMatcherType;
  actionType: PermissionActionType;
  type: PermissionType;
  category?: Nullable<RbacPermissionCategory>;
  policies?: RbacPolicy[];
};

export type RbacPolicy = {
  id: string;
  type: AdminRbacPolicyType;
  permission: RbacPermission;
};

export type RbacRole = {
  id: string;
  name: string;
  policies: RbacPolicy[];
  users?: ApiUser[];
};

export type RoleWithUsers = RbacRole & { users: ApiUser[] };

export type MemberWithRole = {
  user: ApiUser;
  role?: Nullable<RbacRole>;
};

export type AuthorizationCheckResult = {
  url: string;
  allowed: PermissionActionType[];
  denied: PermissionActionType[];
  actorId?: string;
};


export type ActionMenuGroup = {
  actions: ActionMenuEntry[];
};

export type ActionMenuEntry = {
  icon?: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  to?: string;
};


export type HeaderButtonAction = {
  type: "button";
  props: React.ComponentProps<typeof Button> & {
    link?: React.ComponentProps<typeof Link>;
  };
};

export type HeaderActionMenu = {
  type: "action-menu";
  props: {
    groups: ActionMenuGroup[];
  };
};

export type HeaderCustomAction = {
  type: "custom";
  children: React.ReactNode;
};


export type HeaderAction = HeaderButtonAction | HeaderActionMenu | HeaderCustomAction;
