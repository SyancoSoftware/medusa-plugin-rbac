import { sdk } from "./sdk";

import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Select,
  Drawer,
  Label,
  Table,
  Badge,
} from "@medusajs/ui";
import { Grid } from "./grid";
import { LoadingSpinner } from "./loading-spinner";
import {
  Nullable,
  RbacRole,
  MemberWithRole,
} from "./types";

const SelectRole: React.FC<{
  currentRole?: Nullable<RbacRole>;
  roles: RbacRole[];
  setChosenRole: (role: Nullable<RbacRole>) => void;
}> = ({ currentRole, roles, setChosenRole }) => {
  const [value, setValue] = useState<string | undefined>(
    currentRole ? currentRole.id : undefined,
  );
  const handleChange = (roleId: string) => {
    setValue(roleId);
    setChosenRole(roles.find((role) => role.id === roleId) ?? null);
  };
  return (
    <div className="w-[256px]">
      <Select onValueChange={handleChange} value={value}>
        <Select.Trigger>
          <Select.Value placeholder="Seleccionar rol" />
        </Select.Trigger>
        <Select.Content>
          {roles &&
            roles.map((item) => (
              <Select.Item key={item.id} value={item.id}>
                {item.name}
              </Select.Item>
            ))}
        </Select.Content>
      </Select>
    </div>
  );
};

const AvailableRolesList: React.FC<{
  currentRole?: Nullable<RbacRole>;
  setChosenRole: (role: Nullable<RbacRole>) => void;
}> = ({ currentRole, setChosenRole }) => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [roles, setRoles] = useState<RbacRole[]>([]);
  useEffect(() => {
    if (!isLoading) {
      return;
    }
    sdk.client.fetch<RbacRole[]>(`/admin/rbac/roles`, {
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
    <>
      {isLoading && <LoadingSpinner />}
      {!isLoading && (
        <SelectRole
          currentRole={currentRole}
          roles={roles}
          setChosenRole={setChosenRole}
        />
      )}
    </>
  );
};

const DrawerEditUser: React.FC<{
  currentRole?: Nullable<RbacRole>;
  setRole: (role: Nullable<RbacRole>) => void;
}> = ({ currentRole, setRole }) => {
  const [chosenRole, setChosenRole] = useState<Nullable<RbacRole>>(
    currentRole ?? null,
  );
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  return (
    <Drawer open={drawerIsOpen} onOpenChange={setDrawerIsOpen}>
      <Drawer.Trigger asChild>
        <Button>{`Asignar`}</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Seleccionar rol</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="p-4">
          <Grid container direction="column" columnSpacing={10} rowSpacing={3}>
            <Grid>
              <Label>Elegir rol</Label>
            </Grid>
            <Grid>
              <AvailableRolesList
                currentRole={currentRole}
                setChosenRole={setChosenRole}
              />
            </Grid>
          </Grid>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancelar</Button>
          </Drawer.Close>
          <Button
            onClick={() => {
              setRole(chosenRole);
              setDrawerIsOpen(false);
            }}
          >
            Guardar
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

const RoleBadge: React.FC<{ role?: Nullable<RbacRole> }> = ({ role }) => {
  if (role) {
    return (
      <Badge size="small" color="green">
        {role.name}
      </Badge>
    );
  }
  return <Badge size="small">Sin asignar</Badge>;
};

function MembersTableComponent() {
  const [members, setMembers] = useState<MemberWithRole[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const assignRole = (roleId: string, userId: string) => {
    sdk.client.fetch<{ message?: string }>(`/admin/rbac/members/assignments`, {
      method: "POST",
      body: {
        userId,
        roleId,
      },
    })
      .then(({ message }) => {
        setLoading(true);
        if (message) {
          throw message;
        }
      })
      .catch((e) => {
        setLoading(true);
        console.error(e);
      });
  };
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
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 3;
  const pageCount = Math.ceil(members.length / pageSize);
  const canNextPage = useMemo(
    () => currentPage < pageCount - 1,
    [currentPage, pageCount],
  );
  const canPreviousPage = useMemo(() => currentPage - 1 >= 0, [currentPage]);
  const nextPage = () => {
    if (canNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };
  const previousPage = () => {
    if (canPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };
  const currentMembers = useMemo<MemberWithRole[]>(() => {
    if (isLoading) {
      return [] as MemberWithRole[];
    }
    const offset = currentPage * pageSize;
    const limit = Math.min(offset + pageSize, members.length);
    return members.slice(offset, limit);
  }, [currentPage, pageSize, members, isLoading]);
  return (
    <div className="flex gap-1 flex-col">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Nombre</Table.HeaderCell>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>Rol</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {currentMembers.map((member) => {
            const name =
              member.user.first_name !== null && member.user.last_name !== null
                ? `${member.user.first_name} ${member.user.last_name}`
                : "-";
            return (
              <Table.Row
                key={member.user.id}
                className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap"
              >
                <Table.Cell>{name}</Table.Cell>
                <Table.Cell>{member.user.email}</Table.Cell>
                <Table.Cell>
                  <RoleBadge role={member.role} />
                </Table.Cell>
                <Table.Cell>
                  <DrawerEditUser
                    currentRole={member.role}
                    setRole={(role) =>
                      role?.id && assignRole(role.id, member.user.id)
                    }
                  />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      <Table.Pagination
        count={members.length}
        pageSize={pageSize}
        pageIndex={currentPage}
        pageCount={pageCount}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        previousPage={previousPage}
        nextPage={nextPage}
        translations={
          {
            results: "resultados",
            "of": "de",
            pages: "páginas",
            prev: "Anterior",
            next: "Siguiente"
          }
        }
      />
    </div>
  );
}

export const MembersTable = React.memo(MembersTableComponent);
