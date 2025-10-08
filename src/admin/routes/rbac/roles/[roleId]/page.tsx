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
  } from "@medusajs/ui";
  import React, { useState, useEffect, useMemo } from "react";
  import {
    Pencil,
  } from "@medusajs/icons";
  import { useParams } from "react-router-dom";
import { AdminRbacPolicyType, ApiUser, Grid, LoadingSpinner, RbacPermissionCategory, RbacPolicy, RbacRole, RoleWithUsers, sdk } from "../../../../lib";
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
      setError("Name cannot be empty");
      return false;
    }
    useEffect(() => {
      setError(undefined);
    }, [drawerIsOpen]);
    return (
      <Drawer open={drawerIsOpen} onOpenChange={setDrawerIsOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit role</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <Grid container direction="column" rowSpacing={3}>
              <Grid>
                <Label>Name</Label>
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
              <Button variant="secondary">Cancel</Button>
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
              Update
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
      sdk.client.fetch(`/admin/rbac/roles/${rbacRole.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(role),
      })
        .then((res) => (res as Response).json())
        .then(({ message }) => {
          reloadTable();
          setDrawerIsOpen(false);
          if (message) {
            throw message;
          }
        })
        .catch((e) => {
          reloadTable();
          setDrawerIsOpen(false);
          console.error(e);
        });
    }
    return (
      <Container className="divide-y">
        <Header
          title="Overview"
          actions={[
            {
              type: "action-menu",
              props: {
                groups: [
                  {
                    actions: [
                      {
                        icon: <Pencil />,
                        label: "Edit",
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
        <SectionRow title="Name" value={rbacRole.name} />
        <SectionRow
          title="Policies"
          value={`${rbacRole.policies.filter((pol: RbacPolicy) => pol.type === AdminRbacPolicyType.ALLOW).length} allowed,
                    ${rbacRole.policies.filter((pol: RbacPolicy) => pol.type === AdminRbacPolicyType.DENY).length} denied`}
        />
        <SectionRow
          title="Users"
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
              <Table.HeaderCell>Name</Table.HeaderCell>
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
        />
      </div>
    );
  }
  const RbacRoleAssignedUsers: React.FC<{ rbacRole: RoleWithUsers }> = ({ rbacRole }) => {
    return (
      <Container>
        <Grid container direction="column" className="divide-y">
          <Grid>
            <Header title={`Assigned users`} />
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
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Target</Table.HeaderCell>
            <Table.HeaderCell>Action</Table.HeaderCell>
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
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Permissions</Table.HeaderCell>
            <Table.HeaderCell>Allow</Table.HeaderCell>
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
          />
        )}
      </div>
    );
  }
  const RbacRoleAssignedPolicies: React.FC<{ rbacRole: RoleWithUsers }> = ({ rbacRole }) => {
    const [viewType, setViewType] = useState(
      "permission",
      /* PERMISSION */
    );
    return (
      <Container>
        <Grid container direction="column" className="divide-y">
          <Header
            title={`Assigned policies`}
            actions={[
              {
                type: "custom",
                children: (
                  <Grid container paddingRight={5} spacing={2}>
                    <Grid>
                      <Text>
                        {viewType === "category"
                          ? "Category view"
                          : "Permission view"}
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
      sdk.client.fetch(`/admin/rbac/roles/${roleId}`)
        .then((res) => (res as Response).json())
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
        });
    }, [isLoading]);
    if (isLoading || !role) {
      return <LoadingSpinner />;
    }
    return (
      <SingleColumnLayout>
        <RbacRoleGeneral rbacRole={role} reloadTable={() => setLoading(true)} />
        <RbacRoleAssignedUsers rbacRole={role} />
        <RbacRoleAssignedPolicies rbacRole={role} />
      </SingleColumnLayout>
    );
  };