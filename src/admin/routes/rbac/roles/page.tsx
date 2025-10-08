import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading } from "@medusajs/ui";
import { Grid, RbacLicenceCheck, RbacAuthorizationCheck } from "../../../lib";
import { RolesTable } from "../../../lib/roles-table";

const RolesPage = () => {
  return (
    <RbacLicenceCheck>
      <RbacAuthorizationCheck>
        <Grid container direction="column" rowSpacing={3}>
          <Grid>
            <Heading level="h1">Roles</Heading>
          </Grid>
          <Grid>
            <Container>
              <RolesTable />
            </Container>
          </Grid>
        </Grid>
      </RbacAuthorizationCheck>
    </RbacLicenceCheck>
  );
};

export const config = defineRouteConfig({
  label: "Roles",
});

export default RolesPage;
