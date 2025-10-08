import React, { useState, useEffect } from "react";
import { Container, Alert } from "@medusajs/ui";
import {
  AuthorizationCheckResult,
  PermissionActionType,
  RoleWithUsers,
} from "./types";
import { sdk } from "./sdk";

const isAuthorizationCheckResult = (
  value: unknown,
): value is AuthorizationCheckResult => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<AuthorizationCheckResult>;
  return (
    typeof candidate.url === "string" &&
    Array.isArray(candidate.allowed) &&
    Array.isArray(candidate.denied)
  );
};

function getActionMessage(actionType: PermissionActionType) {
  switch (actionType) {
    case PermissionActionType.READ:
      return `read, so you cannot view the content`;
    case PermissionActionType.WRITE:
      return `write, so you are not able to create the content`;
    case PermissionActionType.DELETE:
      return `delete, so you are not able to delete the content`;
    default:
      return "unknown action";
  }
}

const ActionsList: React.FC<{ actionTypes: PermissionActionType[] }> = ({
  actionTypes,
}) => {
  return (
    <ul>
      {actionTypes.map((actionType) => (
        <li key={actionType}>{` - ${getActionMessage(actionType)}`}</li>
      ))}
    </ul>
  );
};

export const TestMyAuthorization: React.FC<{ urlToTest: string }> = ({
  urlToTest,
}) => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [authorizationResult, setAuthorizationResult] =
    useState<AuthorizationCheckResult | undefined>(undefined);

  useEffect(() => {
    if (!isLoading) {
      return;
    }
    sdk.client.fetch(`/admin/rbac/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urlToTest,
      }),
    })
      .then((res) => (res as Response).json() as Promise<RoleWithUsers[]>)
      .then((responseJson) => {
        if (isAuthorizationCheckResult(responseJson)) {
          setAuthorizationResult(responseJson);
        } else {
          setAuthorizationResult(undefined);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [isLoading, urlToTest]);

  return (
    <>
      {!isLoading &&
        authorizationResult &&
        authorizationResult.denied.length > 0 && (
          <Container>
            <Alert variant="error">
              {`You are unauthorized to:`}
              <ActionsList actionTypes={authorizationResult.denied} />
            </Alert>
          </Container>
        )}
    </>
  );
};
