import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading } from "@medusajs/ui";
import React from "react";
import {
  Grid,
  RbacLicenceCheck,
  RbacAuthorizationCheck,
  PermissionType,
} from "../../lib";
import { PermissionsPredefinedArea } from "../../lib/permission-predefined-area";
import { PermissionsCustomArea } from "../../lib/permissions-custom-area";

const PermissionsTable: React.FC<{ permissionType: PermissionType }> = ({
  permissionType,
}) => {
  return (
    <>
      {permissionType === PermissionType.PREDEFINED && (
        <PermissionsPredefinedArea />
      )}
      {permissionType === PermissionType.CUSTOM && <PermissionsCustomArea />}
    </>
  );
};

const PermissionsPage = () => {
  return (
    <RbacLicenceCheck>
      <RbacAuthorizationCheck>
        <Grid container direction="column" rowSpacing={3}>
          <Grid>
            <Heading level="h1">Permissions</Heading>
          </Grid>
          <Grid>
            <Container style={{ marginTop: 15 }}>
              <PermissionsTable permissionType={PermissionType.CUSTOM} />
            </Container>
          </Grid>
          <Grid>
            <Container>
              <PermissionsTable permissionType={PermissionType.PREDEFINED} />
            </Container>
          </Grid>
        </Grid>
      </RbacAuthorizationCheck>
    </RbacLicenceCheck>
  );
};

export const config = defineRouteConfig({
  label: "Permissions",
});

export default PermissionsPage;
