import { sdk } from "./sdk";

import React, { useState, useEffect } from "react";
import { Container, Heading, Text, Button,  } from "@medusajs/ui";
import { Grid } from "./grid";
import { Users, AcademicCap, LockClosedSolid } from "@medusajs/icons";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "./loading-spinner";
import {
  RbacPermission,
  MemberWithRole,
  RoleWithUsers,
  PermissionType,
} from "./types";

export const DashboardMembersCard: React.FC = () => {
  const [members, setMembers] = useState<MemberWithRole[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (!isLoading) {
      return;
    }
    sdk.client.fetch<MemberWithRole[]>(`/admin/rbac/members`, {
    })
      .then((result) => {
        setMembers(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [isLoading]);
  return (
    <Container>
      <Grid container direction="column" spacing={3}>
        <Grid container alignItems="center">
          <Grid>
            {isLoading && <LoadingSpinner size={10} />}
            {!isLoading && (
              <Heading>
                {members.length} {members.length === 1 ? "miembro" : "miembros"}
              </Heading>
            )}
          </Grid>
          <Grid>{!isLoading && <Users />}</Grid>
        </Grid>
        <Grid>
          {isLoading && <LoadingSpinner size={10} />}
          {!isLoading && (
            <Text>
              {members.filter((member) => member.role !== undefined).length}{" "}
              asignados
            </Text>
          )}
        </Grid>
        <Grid>
          {isLoading && <LoadingSpinner size={10} />}
          {!isLoading && (
            <Text>
              {members.filter((member) => member.role === undefined).length}{" "}
              sin asignar
            </Text>
          )}
        </Grid>
        <Grid>
          <Link
            to={`/rbac/members`}
            style={{
              display: "contents",
            }}
          >
            <Button>Configurar</Button>
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
};

export const DashboardRolesCard = () => {
  const [roles, setRoles] = useState<RoleWithUsers[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (!isLoading) {
      return;
    }
    sdk.client.fetch<RoleWithUsers[]>(`/admin/rbac/roles`, {
    })
      .then((roles2) => {
        setRoles(roles2);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [isLoading]);
  return (
    <Container>
      <Grid container direction="column" spacing={3}>
        <Grid container alignItems="center">
          <Grid>
            {isLoading && <LoadingSpinner size={10} />}
            {!isLoading && (
              <Heading>
                {roles.length} {roles.length === 1 ? "role" : "roles"}
              </Heading>
            )}
          </Grid>
          <Grid>{!isLoading && <AcademicCap />}</Grid>
        </Grid>
        <Grid>
          {isLoading && <LoadingSpinner size={10} />}
          {!isLoading && (
            <Text>
              {
                roles.filter(
                  (role) => role.users !== undefined && role.users.length > 0,
                ).length
              }{" "}
              used
            </Text>
          )}
        </Grid>
        <Grid>
          {isLoading && <LoadingSpinner size={10} />}
          {!isLoading && (
            <Text>
              {
                roles.filter(
                  (role) => role.users === undefined || role.users.length === 0,
                ).length
              }{" "}
              not used
            </Text>
          )}
        </Grid>
        <Grid>
          <Link
            to={`/rbac/roles`}
            style={{
              display: "contents",
            }}
          >
            <Button>Configurar</Button>
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
};

const AssignedRolesList: React.FC<{ sortedRoles: RoleWithUsers[] }> = ({
  sortedRoles,
}) => {
  return (
    <Grid container direction="column" rowSpacing={2}>
      {sortedRoles.map((sortedRole) => {
        return (
          <Grid
            key={sortedRole.id}
            container
            columnSpacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Grid>
              <Text>{sortedRole.name}</Text>
            </Grid>
            <Grid container columnSpacing={1} alignItems="center">
              <Grid>
                <Text>{sortedRole.users.length}</Text>
              </Grid>
              <Grid>
                <Users />
              </Grid>
            </Grid>
          </Grid>
        );
      })}
      {sortedRoles.length === 0 && (
        <Grid>
          <Text>{`-`}</Text>
        </Grid>
      )}
    </Grid>
  );
};

export const DashboardAssignedRolesCard: React.FC = () => {
  const [roles, setRoles] = useState<RoleWithUsers[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (!isLoading) {
      return;
    }
    sdk.client.fetch<RoleWithUsers[]>(`/admin/rbac/roles`, {
    })
      .then((roles2) => {
        const sorted = roles2
          .slice()
          .sort((a, b) => (b.users?.length ?? 0) - (a.users?.length ?? 0));
        setRoles(sorted as RoleWithUsers[]);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [isLoading]);
  return (
    <Container>
      <Grid container direction="column" spacing={3}>
        <Grid>
          {isLoading && <LoadingSpinner size={10} />}
          {!isLoading && <Heading>{`Roles mas usados`}</Heading>}
        </Grid>
        <Grid>
          {isLoading && <LoadingSpinner size={10} />}
          {!isLoading && <AssignedRolesList sortedRoles={roles} />}
        </Grid>
      </Grid>
    </Container>
  );
};

export const DashboardPermissionsCard: React.FC = () => {
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (!isLoading) {
      return;
    }
    sdk.client.fetch<RbacPermission[]>(`/admin/rbac/permissions`, {
    })
      .then((result) => {
        setPermissions(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [isLoading]);
  return (
    <Container>
      <Grid container direction="column" spacing={3}>
        <Grid container alignItems="center">
          <Grid>
            {isLoading && <LoadingSpinner size={10} />}
            {!isLoading && (
              <Heading>
                {permissions.length}{" "}
                {permissions.length === 1 ? "permiso" : "permisos"}
              </Heading>
            )}
          </Grid>
          <Grid>{!isLoading && <LockClosedSolid />}</Grid>
        </Grid>
        <Grid>
          {isLoading && <LoadingSpinner size={10} />}
          {!isLoading && (
            <Text>
              {
                permissions.filter(
                  (perm) => perm.type === PermissionType.PREDEFINED,
                ).length
              }{" "}
              predefinido
            </Text>
          )}
        </Grid>
        <Grid>
          {isLoading && <LoadingSpinner size={10} />}
          {!isLoading && (
            <Text>
              {
                permissions.filter((perm) => perm.type === PermissionType.CUSTOM)
                  .length
              }{" "}
              personalizado
            </Text>
          )}
        </Grid>
        <Grid>
          <Link
            to={`/rbac/permissions`}
            style={{
              display: "contents",
            }}
          >
            <Button>Configurar</Button>
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
};

export const Dashboard = () => {
  return (
    <Grid
      container
      rowSpacing={10}
      columnSpacing={10}
      style={{
        marginTop: 15,
      }}
    >
      <Grid size={4}>
        <DashboardPermissionsCard />
      </Grid>
      <Grid size={4}>
        <DashboardRolesCard />
      </Grid>
      <Grid size={4}>
        <DashboardMembersCard />
      </Grid>
      <Grid size={4}>
        <DashboardAssignedRolesCard />
      </Grid>
    </Grid>
  );
};
