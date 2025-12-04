import { defineMiddlewares } from "@medusajs/medusa";
import {
  ContainerRegistrationKeys,
  MedusaError,
  MedusaErrorTypes,
} from "@medusajs/framework/utils";

import { RBAC_MODULE } from "../modules/rbac";
import { PermissionMatcherType } from "../modules/rbac/types";
import { convertApiMethodToRbacAction } from "../modules/rbac/utils";
import type { ActionType } from "../modules/rbac/types";
import { LicenceStatus } from "../modules/rbac/service";

let cachedLicenseStatus: LicenceStatus | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 1000 * 60 * 5;

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/licence",
      middlewares: [
        async (req: any, res: any, next: () => void) => {
          if (
            cachedLicenseStatus &&
            cachedLicenseStatus === LicenceStatus.VALID &&
            Date.now() - (cacheTimestamp ?? Date.now()) < CACHE_DURATION
          ) {
            return res.status(200).json({
              licence: cachedLicenseStatus,
            });
          }

          const rbacModuleService = req.scope.resolve(RBAC_MODULE);

          try {
            const result = await rbacModuleService.checkLicence();
            cachedLicenseStatus = result;
            cacheTimestamp = Date.now();

            return res.status(200).json({
              licence: result,
            });
          } catch (error: any) {
            throw new MedusaError(
              MedusaErrorTypes.DB_ERROR,
              error.message ?? "Failed to check licence"
            );
          }
        },
      ],
    },
    {
      matcher: "/admin/*",
      middlewares: [
        async (req: any, res: any, next: () => void) => {
          const rawRequest = req as any & { baseUrl: string };
          const logger =
            (req.scope.resolve?.("logger") as any) || console;

          if (rawRequest.baseUrl === "/admin/rbac/check") {
            return next();
          }

          const normalizedPath = (rawRequest.baseUrl || "")
            .split("?")[0]
            .replace(/\/+$/, "") || "/";

          const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
          const {
            data: rolesWithUsers,
          }: { data: Array<any> } = await query.graph({
            entity: "rbac_role",
            fields: ["*", "users.*"],
          });

          const actorId = rawRequest.session?.auth_context?.actor_id;
          if (!actorId) {
            return next();
          }

          const existingRole = rolesWithUsers.find((role: any) =>
            role.users.find((user: any) => user.id === actorId)
          );

          if (!existingRole) {
            return next();
          }

          const rbacModuleService = req.scope.resolve(RBAC_MODULE);
          const rbacAction = convertApiMethodToRbacAction(
            rawRequest.method as string
          ) as ActionType | undefined;

          if (!rbacAction) {
            return next();
          }

          const authorization =
            await rbacModuleService.evaluateAuthorization(
              existingRole,
              PermissionMatcherType.API,
              normalizedPath,
              rbacAction
            );

          if (!authorization) {
            logger?.info?.(
              `[RBAC] deny actor=${actorId} method=${rawRequest.method} path=${normalizedPath}`
            );
            return res.status(403).json({
              unauthorized: true,
              message: "No autorizado para acceder a este recurso.",
            });
          }

          logger?.debug?.(
            `[RBAC] allow actor=${actorId} method=${rawRequest.method} path=${normalizedPath}`
          );
          return next();
        },
      ],
    },
  ],
});
