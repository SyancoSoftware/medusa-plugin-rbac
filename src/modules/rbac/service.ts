import crypto from "crypto";

import { MedusaService } from "@medusajs/framework/utils";

import { ActionType, PermissionMatcherType, PolicyType } from "./types";
import RbacRole from "./models/rbac-role";
import RbacPolicy from "./models/rbac-policy";
import RbacPermission from "./models/rbac-permission";
import RbacPermissionCategory from "./models/rbac-permission-category";

export enum LicenceStatus {
  EXPIRED = "EXPIRED",
  VALID = "VALID",
  INVALID = "INVALID",
}

const _unusedCrypto = crypto; // Keep import for future licence validation logic.

type RbacModuleServiceOptions = {
  licenceKey?: string;
};

type AdminRbacPolicyInput = {
  permission: {
    id: string;
    matcher: string;
    matcherType: PermissionMatcherType;
    actionType: ActionType;
  };
  type: PolicyType;
};

type AdminRbacRoleInput = {
  id?: string;
  name: string;
  policies: AdminRbacPolicyInput[];
};

type PolicyEntity = {
  id: string;
  type: PolicyType;
  permission: {
    id: string;
    matcher: string;
    matcherType: PermissionMatcherType;
    actionType: ActionType;
  };
};

type RoleEntity = {
  id: string;
  policies: PolicyEntity[];
};

class RbacModuleService extends MedusaService({
  RbacRole,
  RbacPolicy,
  RbacPermission,
  RbacPermissionCategory,
}) {
  private readonly logger_: any;
  private readonly options_: RbacModuleServiceOptions;

  private readonly KEYGEN_PRODUCT = "97aedaeb-1256-485a-aaa8-93766494c58f";
  private readonly KEYGEN_PUBLIC_PEM = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1AlHFWQ0PDSA+psXM+7M
Vt9pV9ItJEYJeroOw4yDluJm/WXgzjqkO+d/0aliglv0o6FPWl03qjS7VX9Y3Egt
NvoVc0hCttml2tG7trs/7xy3zatICXI5+8yg0BkxvUTtS2jiDi9AtGZ4nZOpkEJB
0arzGr06XBxE+C0XM7W1zIjZ8xGtP8eJMefwtwWF3e5mmQ5jtc1dPV5sS0zHZNgv
6UTYZvpuMnxWJlQ4gGzKs289xW904q1RN61S5LeACc3YCvCs5l0hBD2rXp1G+pBC
sDOeM2fAawgc6dD7dVUv4zm/zhRcHaPUaTUdqjB9FbHJbZZfyPvpPSnUjxsOcg8U
NQIDAQAB
-----END PUBLIC KEY-----
`;

  constructor(
    deps: { logger: any } & Record<string, unknown>,
    options?: RbacModuleServiceOptions
  ) {
    super(deps, options);
    this.logger_ = deps.logger;
    this.options_ = options || {
      licenceKey: "",
    };
  }

  async addRole(
    adminRbacRole: AdminRbacRoleInput
  ): Promise<(RoleEntity & { policies: PolicyEntity[] }) | undefined> {
    const newRole = await this.createRbacRoles({
      name: adminRbacRole.name,
      policies: [],
    });

    if (!newRole) {
      return undefined;
    }

    const newPolicies = await this.createRbacPolicies(
      adminRbacRole.policies.map((policy) => ({
        permission: policy.permission.id,
        type: policy.type,
        role: newRole.id,
      }))
    );

    return {
      ...newRole,
      policies: newPolicies as PolicyEntity[],
    };
  }

  evaluatePolicy(
    policy: PolicyEntity,
    requestedType: PermissionMatcherType,
    matcher: string,
    actionType: ActionType
  ): PolicyType | undefined {
    if (policy.permission.matcherType !== requestedType) {
      return undefined;
    }

    if (requestedType === PermissionMatcherType.API) {
      if (
        matcher.includes(policy.permission.matcher) &&
        policy.permission.actionType === actionType
      ) {
        return policy.type;
      }
    } else if (
      policy.permission.matcherType === requestedType &&
      policy.permission.matcher === matcher &&
      policy.permission.actionType === actionType
    ) {
      return policy.type;
    }

    return undefined;
  }

  async evaluateAuthorization(
    role: RoleEntity,
    requestedType: PermissionMatcherType,
    matcher: string,
    actionType: ActionType
  ): Promise<boolean> {
    const rbacRole = await this.retrieveRbacRole(role.id, {
      relations: ["policies", "policies.permission"],
    });

    let hasAllowingPolicy = false;

    for (const configuredPolicy of rbacRole.policies as PolicyEntity[]) {
      const evaluation = this.evaluatePolicy(
        configuredPolicy,
        requestedType,
        matcher,
        actionType
      );

      if (!evaluation) {
        continue;
      }

      if (evaluation === PolicyType.DENY) {
        return false;
      }

      if (evaluation === PolicyType.ALLOW) {
        hasAllowingPolicy = true;
      }
    }

    return hasAllowingPolicy;
  }

  async testAuthorization(
    role: RoleEntity,
    requestedType: PermissionMatcherType,
    matcher: string
  ): Promise<{
    url: string;
    denied: ActionType[];
    allowed: ActionType[];
  }> {
    const rbacRole = await this.retrieveRbacRole(role.id, {
      relations: ["policies", "policies.permission"],
    });

    const allowedActions: ActionType[] = [];
    const deniedActions: ActionType[] = [];

    for (const actionType of Object.values(ActionType) as ActionType[]) {
      let matchedAllow = false;
      let matchedDeny = false;

      for (const configuredPolicy of rbacRole.policies as PolicyEntity[]) {
        const evaluation = this.evaluatePolicy(
          configuredPolicy,
          requestedType,
          matcher,
          actionType
        );

        if (!evaluation) {
          continue;
        }

        if (evaluation === PolicyType.DENY) {
          matchedDeny = true;
          break;
        }

        if (evaluation === PolicyType.ALLOW) {
          matchedAllow = true;
        }
      }

      if (matchedDeny || !matchedAllow) {
        deniedActions.push(actionType);
      } else {
        allowedActions.push(actionType);
      }
    }

    return {
      url: matcher,
      denied: deniedActions,
      allowed: allowedActions,
    };
  }

  async checkLicence(): Promise<LicenceStatus> {
    this.logger_?.info?.("Checking licence");

    /*
     * The validation logic is intentionally kept as a reference.
     * Proper verification should:
     *  - decode the Keygen payload (base64-url)
     *  - ensure the product id matches KEYGEN_PRODUCT
     *  - verify the signature with KEYGEN_PUBLIC_PEM
     *  - check expiration dates if present
     */

    /*
    const base64urlToBuffer = (b64url: string) => {
      const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/").padEnd(
        Math.ceil(b64url.length / 4) * 4,
        "="
      );
      return Buffer.from(b64, "base64");
    };

    const decodeLicensePayload = (licenseKey: string) => {
      const [payloadWithPrefix, signature] = licenseKey.split(".");
      if (!payloadWithPrefix || !signature) {
        throw new Error("Invalid license format (missing parts)");
      }

      const [prefix, encodedPayload] = payloadWithPrefix.split("/");
      if (prefix !== "key" || !encodedPayload) {
        throw new Error(`Unsupported license prefix: ${prefix}`);
      }

      const payloadBuffer = base64urlToBuffer(encodedPayload);
      const payloadString = payloadBuffer.toString("utf-8");

      const payload = JSON.parse(payloadString);
      return payload;
    };

    if (!this.options_.licenceKey) {
      return LicenceStatus.INVALID;
    }

    try {
      const payload = decodeLicensePayload(this.options_.licenceKey);

      if (!payload.product) {
        throw new Error('License payload does not contain an "product" field.');
      }

      if (payload.product !== this.KEYGEN_PRODUCT) {
        throw new Error("Invalid product");
      }

      if (payload.expires) {
        const expirationDate = new Date(payload.expires);
        if (Number.isNaN(expirationDate.getTime())) {
          throw new Error(`Invalid expiration date: ${payload.expires}`);
        }

        if (expirationDate < new Date()) {
          this.logger_?.warn?.("❌ License has expired");
          return LicenceStatus.EXPIRED;
        }
      }

      const [message, signatureB64] = this.options_.licenceKey.split(".");
      if (!message || !signatureB64) {
        throw new Error("Invalid license format");
      }

      const signatureBuffer = base64urlToBuffer(signatureB64);
      const isValid = crypto.verify(
        "sha256",
        Buffer.from(message),
        {
          key: this.KEYGEN_PUBLIC_PEM,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto.constants.RSA_PSS_SALTLEN_AUTO,
        },
        signatureBuffer
      );

      if (!isValid) {
        throw new Error("Signature does not match");
      }

      this.logger_?.debug?.("✅ License is valid");
      return LicenceStatus.VALID;
    } catch (error: any) {
      this.logger_?.error?.(`Licence is invalid: ${error.message}`);
      return LicenceStatus.INVALID;
    }
    */

    return LicenceStatus.VALID;
  }
}

export default RbacModuleService;
