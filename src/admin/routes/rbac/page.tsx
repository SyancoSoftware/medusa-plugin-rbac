import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Heading } from "@medusajs/ui";
import { Users } from "@medusajs/icons";
import { Grid, Dashboard, RbacLicenceCheck, RbacAuthorizationCheck } from "../../lib";

const MainPage = () => {
  return (
    <Grid container direction="column" rowSpacing={3}>
      <Grid>
        <Heading level="h1">RBAC system</Heading>
      </Grid>
      <Grid>
        <Dashboard />
      </Grid>
    </Grid>
  );
};

const RbacPage = () => {
  return (
    <RbacLicenceCheck>
      <RbacAuthorizationCheck>
        <MainPage />
      </RbacAuthorizationCheck>
    </RbacLicenceCheck>
  );
};

export const config = defineRouteConfig({
  label: "RBAC",
  icon: Users,
});

export default RbacPage;
