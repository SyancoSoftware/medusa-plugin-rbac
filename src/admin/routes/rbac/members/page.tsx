import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading } from "@medusajs/ui";
import { Grid, RbacLicenceCheck, RbacAuthorizationCheck, MembersTable } from "../../../lib";

const MembersPage = () => {
  return (
    <RbacLicenceCheck>
      <RbacAuthorizationCheck>
        <Grid container direction="column" rowSpacing={3}>
          <Grid>
            <Heading level="h1">Miembros</Heading>
          </Grid>
          <Grid>
            <Container>
              <MembersTable />
            </Container>
          </Grid>
        </Grid>
      </RbacAuthorizationCheck>
    </RbacLicenceCheck>
  );
};

export const config = defineRouteConfig({
  label: "Miembros",
});

export default MembersPage;
