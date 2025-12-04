import { sdk } from "./sdk";

import React, { useState, useEffect } from "react";
import { Alert } from "@medusajs/ui";
import { LoadingSpinner } from "./loading-spinner";
import { Grid } from "./grid";
import { AuthorizationCheckResult } from "./types";
import { LicenceStatus } from "../../modules/rbac/types";


export const RbacAuthorizationCheck: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [authorizationResult, setAuthorizationResult] = useState<
    AuthorizationCheckResult | undefined
  >(undefined);
  useEffect(() => {
    if (!isLoading) {
      return;
    }
    (async () => {
      try {

        const response = await sdk.client.fetch<AuthorizationCheckResult>(`/admin/rbac/check`, {
          method: "POST",
          body: {
            urlToTest: `/admin/rbac`,
          },
        })
        setAuthorizationResult(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }

    })()
  }, [isLoading]);
  if (isLoading) {
    return <LoadingSpinner size={12} />;
  }
  if (authorizationResult && authorizationResult.denied.length > 0) {
    return (
      <Grid container justifyContent="center">
        <Alert variant="error">No está autorizado para administrar RBAC</Alert>
      </Grid>
    );
  }
  return <div>{children}</div>;
};

export const RbacLicenceCheck: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [licenceStatus, setLicenceStatus] = useState<string | undefined>(
    undefined,
  );
  const [isLoading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (!isLoading) {
      return;
    }
    sdk.client.fetch<{ licence: LicenceStatus }>(`/admin/licence`, {
    })
      .then((result) => {
        setLicenceStatus(result.licence);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [isLoading]);
  if (isLoading) {
    return <LoadingSpinner size={12} />;
  }
  if (licenceStatus == undefined) {
    return (
      <Grid container justifyContent="center">
        <Alert variant="error">Cannot get licence status</Alert>
      </Grid>
    );
  }
  switch (licenceStatus) {
    case "EXPIRED":
      return (
        <Grid container justifyContent="center">
          <Alert variant="error">Licence is expired</Alert>
        </Grid>
      );
    case "INVALID":
      return (
        <Grid container justifyContent="center">
          <Alert variant="error">Licence is invalid</Alert>
        </Grid>
      );
  }
  if (licenceStatus !== "VALID") {
    return (
      <Grid container justifyContent="center">
        <Alert variant="error">
          Licence is in unknown state. Please contact us.
        </Alert>
      </Grid>
    );
  }
  return <div>{children}</div>;
};
