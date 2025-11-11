import React, { useState, useEffect } from "react";
import { Container, Alert } from "@medusajs/ui";
import {
  AuthorizationCheckResult,
  PermissionActionType,
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
      return `Listar o ver, para que sea posible ver el contenido`;
    case PermissionActionType.WRITE:
      return `Crear o modificar, para que sea posible crear o modificar el contenido`;
    case PermissionActionType.DELETE:
      return `Eliminar, para que sea posible eliminar el contenido`;
    default:
      return "Accion desconocida";
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
      body: { urlToTest },
    })
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
              {`No estás autorizado para:`}
              <ActionsList actionTypes={authorizationResult.denied} />
            </Alert>
          </Container>
        )}
    </>
  );
};
