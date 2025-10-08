import { sdk } from "./sdk";

import React, { useState, useEffect } from "react";
import { Alert } from "@medusajs/ui";
import { LoadingSpinner } from "./loading-spinner";
import { Grid } from "./grid";
import { AuthorizationCheckResult } from "./types";

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
    sdk.client.fetch(`/admin/rbac/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urlToTest: `/admin/rbac`,
      }),
    })
      .then((res) => (res as Response).json() as Promise<AuthorizationCheckResult>)
      .then((responseJson) => {
        setAuthorizationResult(responseJson);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [isLoading]);
  if (isLoading) {
    return <LoadingSpinner size={12} />;
  }
  if (authorizationResult && authorizationResult.denied.length > 0) {
    return (
      <Grid container justifyContent="center">
        <Alert variant="error">You are unauthorized to manage RBAC</Alert>
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
    sdk.client.fetch(`/admin/licence`, {
    })
      .then((res) => (res as Response).json() as Promise<{ licence: string }>)
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
