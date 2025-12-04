import {
  Container,
  Alert,
  Text,
  Button,
  Drawer,
  Label,
  Table,
  Badge,
  Input,
  Switch,
  Select,
  toast,
} from "@medusajs/ui";
import React, { useState, useEffect, useMemo } from "react";
import {
  Pencil,
} from "@medusajs/icons";
import { useParams } from "react-router-dom";
import { AdminRbacPolicyType, ApiUser, Grid, LoadingSpinner, MemberWithRole, RbacPermission, RbacPermissionCategory, RbacPolicy, RbacRole, RoleWithUsers, sdk } from "../../../../lib";
import { SingleColumnLayout } from "../../../../lib/single-column-layout";
import { Header } from "../../../../lib/header";
import { SectionRow } from "../../../../lib/section-row";

const DrawerEditRoleGeneral: React.FC<{
  drawerIsOpen: boolean;
  setDrawerIsOpen: (open: boolean) => void;
  currentRole: RbacRole;
  setRole: (role: RbacRole) => void;
}> = ({
  drawerIsOpen,
  setDrawerIsOpen,
  currentRole,
  setRole,
}) => {
    const [error, setError] = useState<string | undefined>(undefined);
    const [name, setName] = useState(currentRole.name);
    function validateName2(value: string) {
      if (value && value.length > 0) {
        setError(undefined);
        return true;
      }
      setError("El nombre no puede estar vacio");
      return false;
    }
    useEffect(() => {
      setError(undefined);
    }, [drawerIsOpen]);
    return (
      <Drawer open={drawerIsOpen} onOpenChange={setDrawerIsOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Editar rol</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <Grid container direction="column" rowSpacing={3}>
              <Grid>
                <Label>Nombre</Label>
              </Grid>
              <Grid>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    validateName2(e.target.value);
                  }}
                  aria-invalid={error !== undefined}
                />
                {error !== undefined && <Alert variant="error">{error}</Alert>}
              </Grid>
            </Grid>
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button variant="secondary">Cancelar</Button>
            </Drawer.Close>
            <Button
              disabled={error !== undefined}
              onClick={() => {
                if (!error) {
                  setRole({
                    ...currentRole,
                    name,
                  });
                }
              }}
            >
              Actualizar
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    );
  };
const AssignedUsers: React.FC<{ users: ApiUser[] }> = ({ users }) => {
  return (
    <>
      <Text size="small" leading="compact">
        {users.length}
      </Text>
    </>
  );
};
const RbacRoleGeneral: React.FC<{
  rbacRole: RoleWithUsers;
  reloadTable: () => void;
}> = ({ rbacRole, reloadTable }) => {
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  function updateRole(role: RbacRole) {
    sdk.client.fetch<{ message: string }>(`/admin/rbac/roles/${rbacRole.id}`, {
      method: "POST",
      body: role,
    })
      .then(({ message }) => {
        reloadTable();
        setDrawerIsOpen(false);
        if (message) {
          toast.error("Error al actualizar el rol", {
            description: message,
          });
          throw message;
        }
        toast.success("Rol actualizado");
      })
      .catch((e) => {
        reloadTable();
        setDrawerIsOpen(false);
        toast.error("Error al actualizar el rol", {
          description: e?.message ?? e.toString(),
        });
      });
  }
  return (
    <Container className="divide-y">
      <Header
        title="Vista previa"
        actions={[
          {
            type: "action-menu",
            props: {
              groups: [
                {
                  actions: [
                    {
                      icon: <Pencil />,
                      label: "Editar",
                      onClick: () => setDrawerIsOpen(true),
                    },
                  ],
                },
              ],
            },
          },
        ]}
      />
      <DrawerEditRoleGeneral
        drawerIsOpen={drawerIsOpen}
        setDrawerIsOpen={setDrawerIsOpen}
        currentRole={rbacRole}
        setRole={updateRole}
      />
      <SectionRow title="Nombre" value={rbacRole.name} />
      <SectionRow
        title="Politicas"
        value={`${rbacRole.policies.filter((pol: RbacPolicy) => pol.type === AdminRbacPolicyType.ALLOW).length} permitido,
                    ${rbacRole.policies.filter((pol: RbacPolicy) => pol.type === AdminRbacPolicyType.DENY).length} denegado`}
      />
      <SectionRow
        title="Usuarios"
        value={<AssignedUsers users={rbacRole.users} />}
      />
    </Container>
  );
};
function UsersTable({ users }: { users: ApiUser[] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 3;
  const pageCount = Math.ceil(users.length / pageSize);
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
  const currentUsers = useMemo(() => {
    const offset = currentPage * pageSize;
    const limit = Math.min(offset + pageSize, users.length);
    return users.slice(offset, limit);
  }, [currentPage, pageSize, users]);
  return (
    <div className="flex gap-1 flex-col">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>Nombre</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {currentUsers.map((user: ApiUser) => {
            const name =
              user.first_name !== null && user.last_name !== null
                ? `${user.first_name} ${user.last_name}`
                : "-";
            return (
              <Table.Row key={user.id}>
                <Table.Cell>{`${user.email} `}</Table.Cell>
                <Table.Cell>{name}</Table.Cell>
                {user.id}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      <Table.Pagination
        count={users.length}
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

const AssignUserDrawer: React.FC<{
  roleId: string;
  onAssigned: () => void;
}> = ({ roleId, onAssigned }) => {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<MemberWithRole[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | undefined>(undefined);
  const [isAssigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!open || isLoading || members.length > 0) {
      return;
    }
    setLoading(true);
    sdk.client.fetch<MemberWithRole[]>(`/admin/rbac/members`)
      .then((result) => {
        setMembers(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [open, isLoading, members.length]);

  const availableUsers = members.filter(
    (member) => member.role?.id !== roleId
  );

  const handleAssign = () => {
    if (!selectedUser) return;
    setAssigning(true);
    sdk.client.fetch(`/admin/rbac/members/assignments`, {
      method: "POST",
      body: {
        userId: selectedUser,
        roleId,
      },
    })
      .then(() => {
        onAssigned();
        setOpen(false);
        toast.success("Usuario asignado");
      })
      .catch((error) => {
        toast.error("No se pudo asignar el usuario", {
          description: error?.message ?? error.toString(),
        });
      })
      .finally(() => setAssigning(false));
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="secondary">Asignar usuario</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Asignar usuario al rol</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="space-y-4">
          {isLoading && <LoadingSpinner />}
          {!isLoading && (
            <>
              <Label>Seleccionar usuario</Label>
              <Select
                value={selectedUser}
                onValueChange={(value) => setSelectedUser(value)}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Seleccionar usuario" />
                </Select.Trigger>
                <Select.Content>
                  {availableUsers.map((member) => (
                    <Select.Item key={member.user.id} value={member.user.id}>
                      {member.user.email}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              {availableUsers.length === 0 && (
                <Text size="small">No hay usuarios disponibles para asignar.</Text>
              )}
            </>
          )}
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancelar</Button>
          </Drawer.Close>
          <Button
            onClick={handleAssign}
            isLoading={isAssigning}
            disabled={!selectedUser || availableUsers.length === 0}
          >
            Asignar
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

const RbacRoleAssignedUsers: React.FC<{ rbacRole: RoleWithUsers; reload: () => void }> = ({ rbacRole, reload }) => {
  return (
    <Container>
      <Grid container direction="column" className="divide-y">
        <Grid>
          <Header
            title={`Usuarios asignados`}
            actions={[
              {
                type: "custom",
                children: <AssignUserDrawer roleId={rbacRole.id} onAssigned={reload} />,
              },
            ]}
          />
        </Grid>
        <Grid>
          <UsersTable users={rbacRole.users} />
        </Grid>
      </Grid>
    </Container>
  );
};
const policyBadgeDecisionColorMap = new Map([
  ["allow", "green"],
  ["deny", "red"],
  ["partially allow", "purple"],
]);
const PermissionView: React.FC<{ policies: RbacPolicy[] }> = ({ policies }) => {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Nombre</Table.HeaderCell>
          <Table.HeaderCell>Tipo</Table.HeaderCell>
          <Table.HeaderCell>Objetivo</Table.HeaderCell>
          <Table.HeaderCell>Accion</Table.HeaderCell>
          <Table.HeaderCell>Decision</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {policies.map((policy: RbacPolicy) => {
          return (
            <Table.Row key={policy.id}>
              <Table.Cell>{`${policy.permission.name}`}</Table.Cell>
              <Table.Cell>{policy.permission.matcherType}</Table.Cell>
              <Table.Cell>{`${policy.permission.matcher}`}</Table.Cell>
              <Table.Cell>{`${policy.permission.actionType}`}</Table.Cell>
              <Table.Cell>
                <Badge
                  color={
                    policy.type === AdminRbacPolicyType.ALLOW ? "green" : "red"
                  }
                >
                  {policy.type.toUpperCase()}
                </Badge>
              </Table.Cell>
              {policy.id}
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};
const CategoryView: React.FC<{
  currentCategories: (RbacPermissionCategory | null)[];
  allPolicies: RbacPolicy[];
}> = ({ currentCategories, allPolicies }) => {
  function evaluateBadgeDecision(category: RbacPermissionCategory | null) {
    let policiesOfCategory: RbacPolicy[] = [];
    if (category) {
      policiesOfCategory = allPolicies.filter((pol: RbacPolicy) =>
        pol.permission.category !== null && pol.permission.category !== undefined
          ? pol.permission.category.id === category.id
          : false,
      );
    } else {
      policiesOfCategory = allPolicies.filter(
        (pol: RbacPolicy) => pol.permission.category === null || pol.permission.category === undefined,
      );
    }
    if (
      policiesOfCategory.every((pol: RbacPolicy) => pol.type === AdminRbacPolicyType.ALLOW)
    ) {
      return "allow";
    }
    if (
      policiesOfCategory.every((pol: RbacPolicy) => pol.type === AdminRbacPolicyType.DENY)
    ) {
      return "deny";
    }
    return "partially allow";
  }
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Nombre</Table.HeaderCell>
          <Table.HeaderCell>Permisos</Table.HeaderCell>
          <Table.HeaderCell>Permitir</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {currentCategories.map((category: RbacPermissionCategory | null, index: number) => {
          const badgeDecision = evaluateBadgeDecision(category);
          return (
            <Table.Row key={category !== null ? category.id : `null-${index}`} className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap">
              <Table.Cell>{`${category !== null ? category.name : "-"} `}</Table.Cell>
              <Table.Cell>{`${category !== null ? allPolicies.filter((pol: RbacPolicy) => (pol.permission.category !== null && pol.permission.category !== undefined ? pol.permission.category.id === category.id : false)).length : allPolicies.filter((pol: RbacPolicy) => pol.permission.category === null || pol.permission.category === undefined).length}`}</Table.Cell>
              <Table.Cell>
                <Badge color={policyBadgeDecisionColorMap.get(badgeDecision) as "green" | "red" | "purple"}>
                  {badgeDecision.toUpperCase()}
                </Badge>
              </Table.Cell>
              {category !== null ? category.id : "-"}
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};
function PoliciesTable({ policies, viewType }: { policies: RbacPolicy[]; viewType: string }) {
  const categories: (RbacPermissionCategory | null)[] = [];
  for (const policy of policies) {
    if (
      categories.find((cat) => {
        var _a;
        return (
          policy.permission.category === undefined ||
          cat?.id ===
          ((_a = policy.permission.category) == null ? undefined : _a.id)
        );
      })
    )
      continue;
    categories.push(policy.permission.category ?? null);
  }
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 3;
  const pageCount = Math.ceil(policies.length / pageSize);
  const pageCountCategory = Math.ceil(categories.length / pageSize);
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
  const currentPolicies = useMemo(() => {
    const offset = currentPage * pageSize;
    const limit = Math.min(offset + pageSize, policies.length);
    return policies.slice(offset, limit);
  }, [currentPage, pageSize, policies]);
  const currentCategories = useMemo(() => {
    const offset = currentPage * pageSize;
    const limit = Math.min(offset + pageSize, categories.length);
    return categories.slice(offset, limit);
  }, [currentPage, pageSize, policies]);
  return (
    <div className="flex gap-1 flex-col">
      {viewType === "permission" && (
        <PermissionView policies={currentPolicies} />
      )}
      {viewType === "category" && (
        <CategoryView
          currentCategories={currentCategories}
          allPolicies={policies}
        />
      )}
      {viewType === "category" && (
        <Table.Pagination
          count={categories.length}
          pageSize={pageSize}
          pageIndex={currentPage}
          pageCount={pageCountCategory}
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
      )}
      {viewType === "permission" && (
        <Table.Pagination
          count={policies.length}
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
      )}
    </div>
  );
}

const EditPoliciesDrawer: React.FC<{
  rbacRole: RoleWithUsers;
  onUpdated: () => void;
}> = ({ rbacRole, onUpdated }) => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [policySelection, setPolicySelection] = useState<Map<string, AdminRbacPolicyType | "none">>(new Map());
  const [isLoadingPermissions, setLoadingPermissions] = useState(false);
  const [isSaving, setSaving] = useState(false);

  useEffect(() => {
    if (!drawerIsOpen) {
      return;
    }
    const selection = new Map<string, AdminRbacPolicyType | "none">();
    rbacRole.policies.forEach((pol) => {
      selection.set(pol.permission.id, pol.type);
    });
    setPolicySelection(selection);
  }, [drawerIsOpen, rbacRole]);

  useEffect(() => {
    if (!drawerIsOpen || isLoadingPermissions || permissions.length > 0) {
      return;
    }
    setLoadingPermissions(true);
    sdk.client.fetch<RbacPermission[]>(`/admin/rbac/permissions`)
      .then((result) => {
        setPermissions(result);
        setLoadingPermissions(false);
      })
      .catch((error) => {
        console.error(error);
        setLoadingPermissions(false);
      });
  }, [drawerIsOpen, isLoadingPermissions, permissions.length]);

  const setPermissionPolicy = (
    permissionId: string,
    type: AdminRbacPolicyType | "none"
  ) => {
    setPolicySelection((prev) => {
      const next = new Map(prev);
      next.set(permissionId, type);
      return next;
    });
  };

  const savePolicies = () => {
    setSaving(true);
    const policiesPayload = Array.from(policySelection.entries())
      .filter(([, type]) => type !== "none")
      .map(([permissionId, type]) => ({
        permission: permissionId,
        type,
      }));
    sdk.client.fetch<{ message?: string }>(`/admin/rbac/roles/${rbacRole.id}`, {
      method: "POST",
      body: {
        name: rbacRole.name,
        policies: policiesPayload,
      },
    })
      .then(() => {
        onUpdated();
        setDrawerIsOpen(false);
        toast.success("Políticas actualizadas");
      })
      .catch((error) => {
        toast.error("No se pudieron actualizar las políticas", {
          description: error?.message ?? error.toString(),
        });
      })
      .finally(() => setSaving(false));
  };

  return (
    <Drawer open={drawerIsOpen} onOpenChange={setDrawerIsOpen}>
      <Drawer.Trigger asChild>
        <Button variant="secondary">Editar politicas</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Editar politicas del rol</Drawer.Title>
          <Drawer.Description>
            Selecciona los permisos que este rol puede utilizar.
          </Drawer.Description>
        </Drawer.Header>
        <Drawer.Body className="space-y-4">
          {isLoadingPermissions && <LoadingSpinner />}
          {!isLoadingPermissions && (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Permiso</Table.HeaderCell>
                  <Table.HeaderCell>Matcher</Table.HeaderCell>
                  <Table.HeaderCell>Accion</Table.HeaderCell>
                  <Table.HeaderCell>Decision</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {permissions.map((permission) => {
                  const selectedDecision =
                    policySelection.get(permission.id) ?? "none";
                  return (
                    <Table.Row key={permission.id}>
                      <Table.Cell>{permission.name}</Table.Cell>
                      <Table.Cell>{permission.matcher}</Table.Cell>
                      <Table.Cell>{permission.actionType}</Table.Cell>
                      <Table.Cell>
                        <Select
                          value={selectedDecision}
                          onValueChange={(value) =>
                            setPermissionPolicy(
                              permission.id,
                              value as AdminRbacPolicyType | "none"
                            )
                          }
                        >
                          <Select.Trigger>
                            <Select.Value placeholder="Seleccionar decision" />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="none">Ninguno</Select.Item>
                            <Select.Item value={AdminRbacPolicyType.ALLOW}>
                              Permitir
                            </Select.Item>
                            <Select.Item value={AdminRbacPolicyType.DENY}>
                              Denegar
                            </Select.Item>
                          </Select.Content>
                        </Select>
                      </Table.Cell>
                      {permission.id}
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          )}
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancelar</Button>
          </Drawer.Close>
          <Button
            isLoading={isSaving}
            disabled={isLoadingPermissions}
            onClick={savePolicies}
          >
            Guardar
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

const RbacRoleAssignedPolicies: React.FC<{ rbacRole: RoleWithUsers; reloadRole: () => void }> = ({ rbacRole, reloadRole }) => {
  const [viewType, setViewType] = useState(
    "permission",
    /* PERMISSION */
  );
  return (
    <Container>
      <Grid container direction="column" className="divide-y">
        <Header
          title={`Politicas asignadas`}
          actions={[
            {
              type: "custom",
              children: (
                <Grid container paddingRight={5} spacing={2}>
                  <Grid>
                    <Text>
                      {viewType === "category"
                        ? "Vista de categorias"
                        : "Vista de permisos"}
                    </Text>
                  </Grid>
                  <Grid>
                    <Switch
                      onCheckedChange={(checked) =>
                        setViewType(
                          checked ? "category" : "permission",
                          /* PERMISSION */
                        )
                      }
                      checked={viewType === "category"}
                    />
                  </Grid>
                </Grid>
              ),
            },
            {
              type: "custom",
              children: (
                <EditPoliciesDrawer
                  rbacRole={rbacRole}
                  onUpdated={reloadRole}
                />
              ),
            },
          ]}
        />
        <Grid>
          <PoliciesTable policies={rbacRole.policies} viewType={viewType} />
        </Grid>
      </Grid>
    </Container>
  );
};
export const RbacRolePage = () => {
  const { roleId } = useParams();
  const [role, setRole] = useState<RoleWithUsers | undefined>(undefined);
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    if (!isLoading) {
      return;
    }
    sdk.client.fetch<{ role: RoleWithUsers; users: ApiUser[] }>(`/admin/rbac/roles/${roleId}`)
      .then((result) => {
        setRole({
          ...result.role,
          users: result.users,
          policies: result.role.policies,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [isLoading]);
  if (isLoading || !role) {
    return <LoadingSpinner />;
  }
  return (
    <SingleColumnLayout>
      <RbacRoleGeneral rbacRole={role} reloadTable={() => setLoading(true)} />
      <RbacRoleAssignedUsers rbacRole={role} />
      <RbacRoleAssignedPolicies
        rbacRole={role}
        reloadRole={() => setLoading(true)}
      />
    </SingleColumnLayout>
  );
};

export default RbacRolePage;
