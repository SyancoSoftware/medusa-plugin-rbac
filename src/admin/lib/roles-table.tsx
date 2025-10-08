import { sdk } from "./sdk";

import { Toaster, Table, Button, FocusModal, ProgressTabs, toast, Alert, Heading, Text, Input, Label, Drawer, Switch, Select, Prompt, IconButton } from "@medusajs/ui";
import React, { useState, useEffect, useMemo } from "react";
import { Grid } from "./grid";
import { Header } from "./header";
import { RbacRole, AdminRbacPolicyType, RbacPermission, RbacPolicy, RbacPermissionCategory, Nullable } from "./types";
import { useForm } from "react-hook-form";

import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "./loading-spinner";
import { Trash } from "@medusajs/icons";
import { validateName } from "./validateName";

const EditRoleStep: React.FC<{ register: any; errors: any }> = ({ register, errors }) => {
    return (
        <Grid container justifyContent="center">
            <Grid size={4}>
                <Grid container direction="column" spacing={1} marginTop={2}>
                    <Grid>
                        <Heading level="h1">Create role</Heading>
                    </Grid>
                    <Grid>
                        <Text>Set a name which will describe what is a role</Text>
                    </Grid>
                    <Grid container>
                        <Grid>
                            <Grid container direction="column" spacing={1} marginTop={2}>
                                <Grid marginTop={4}>
                                    <Label size="small">Name</Label>
                                </Grid>
                                <Grid>
                                    <Input
                                        placeholder="Store administrator"
                                        {...register("name", {
                                            validateName,
                                        })}
                                        aria-invalid={errors["name"] !== undefined}
                                    />
                                    {errors["name"] !== undefined && (
                                        <Alert variant="error">{errors["name"].message}</Alert>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

const initialTabState: Record<string, "not-started" | "in-progress" | "completed"> = {
    ["general"]: "in-progress" as const,
    ["policies"]: "not-started" as const,
};

const tabOrder = [
    "general",
    "policies",
    /* POLICIES */
];


const CategoryView: React.FC<{
    policies: RbacPolicy[];
    onCheckChange: (checked: boolean, category: RbacPermissionCategory | null) => void;
}> = ({ policies, onCheckChange }) => {
    const categories: (RbacPermissionCategory | null)[] = [];
    for (const policy of policies) {
        if (
            categories.find((cat) => {
                if (!cat || !policy.permission.category) {
                    return cat === policy.permission.category;
                }
                return cat.id === policy.permission.category.id;
            })
        )
            continue;
        categories.push(policy.permission.category ?? null);
    }
    function evaluateStateOfChecked(category: RbacPermissionCategory | null) {
        if (category) {
            const policiesOfCategory = policies.filter((pol) =>
                pol.permission.category !== null && pol.permission.category !== undefined
                    ? pol.permission.category.id === category.id
                    : false,
            );
            return policiesOfCategory.some(
                (pol) => pol.type === AdminRbacPolicyType.ALLOW,
            );
        } else {
            const policiesOfCategory = policies.filter(
                (pol) => pol.permission.category === null,
            );
            return policiesOfCategory.some(
                (pol) => pol.type === AdminRbacPolicyType.ALLOW,
            );
        }
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
                {categories.map((category) => {
                    return (
                        <Table.Row className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap">
                            <Table.Cell>{`${category !== null ? category.name : "-"} `}</Table.Cell>
                            <Table.Cell>{`${category !== null ? policies.filter((pol) => (pol.permission.category !== null && pol.permission.category !== undefined ? pol.permission.category.id === category.id : false)).length : policies.filter((pol) => pol.permission.category === null || pol.permission.category === undefined).length}`}</Table.Cell>
                            <Table.Cell>
                                <Switch
                                    onCheckedChange={(checked) =>
                                        onCheckChange(checked, category)
                                    }
                                    checked={evaluateStateOfChecked(category)}
                                />
                            </Table.Cell>
                            {category !== null ? category.id : "-"}
                        </Table.Row>
                    );
                })}
            </Table.Body>
        </Table>
    );
};

const PermissionsView: React.FC<{
    policies: RbacPolicy[];
    onCheckChange: (checked: boolean, policy: RbacPolicy) => void;
}> = ({ policies, onCheckChange }) => {
    return (
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Matcher</Table.HeaderCell>
                    <Table.HeaderCell>Action type</Table.HeaderCell>
                    <Table.HeaderCell>Allow</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {policies.map((policy) => {
                    return (
                        <Table.Row className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap">
                            <Table.Cell>{`${policy.permission.matcher} `}</Table.Cell>
                            <Table.Cell>{policy.permission.actionType}</Table.Cell>
                            <Table.Cell>
                                <Switch
                                    onCheckedChange={(checked) => onCheckChange(checked, policy)}
                                    checked={policy.type === AdminRbacPolicyType.ALLOW}
                                />
                            </Table.Cell>
                            {policy.permission.name}
                        </Table.Row>
                    );
                })}
            </Table.Body>
        </Table>
    );
};

const PoliciesTable: React.FC<{
    editPolicies: (policies: RbacPolicy[]) => void;
    policies: RbacPolicy[];
}> = ({ editPolicies, policies }) => {
    function onPermissionCheckChange(checked: boolean, policy: RbacPolicy) {
        if (checked) {
            editPolicies([
                {
                    ...policy,
                    type: AdminRbacPolicyType.ALLOW,
                },
            ]);
        } else {
            editPolicies([
                {
                    ...policy,
                    type: AdminRbacPolicyType.DENY,
                },
            ]);
        }
    }
    function onCategoryCheckChange(checked: boolean, category: RbacPermissionCategory | null) {
        if (category) {
            const policiesOfCategory = policies.filter((pol) =>
                pol.permission.category !== null && pol.permission.category !== undefined
                    ? pol.permission.category.id === category.id
                    : false,
            );
            editPolicies(
                policiesOfCategory.map((polCat) => ({
                    ...polCat,
                    type: checked ? AdminRbacPolicyType.ALLOW : AdminRbacPolicyType.DENY,
                })),
            );
        } else {
            const policiesOfCategory = policies.filter(
                (pol) => pol.permission.category === null,
            );
            editPolicies(
                policiesOfCategory.map((polCat) => ({
                    ...polCat,
                    type: checked ? AdminRbacPolicyType.ALLOW : AdminRbacPolicyType.DENY,
                })),
            );
        }
    }
    const [viewType, setViewType] = useState(
        "permission",
        /* PERMISSION */
    );
    return (
        <>
            <Grid container marginBottom={3} spacing={2}>
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
                <Grid>
                    <Text>
                        {viewType === "category" ? "Category view" : "Permission view"}
                    </Text>
                </Grid>
            </Grid>
            <div className="flex gap-1 flex-col">
                {viewType === "permission" && (
                    <PermissionsView
                        policies={policies}
                        onCheckChange={onPermissionCheckChange}
                    />
                )}
                {viewType === "category" && (
                    <CategoryView
                        policies={policies}
                        onCheckChange={onCategoryCheckChange}
                    />
                )}
            </div>
        </>
    );
};

const PoliciesList: React.FC<{
    editPolicies: (policies: RbacPolicy[]) => void;
    policies: RbacPolicy[];
}> = ({ editPolicies, policies }) => {
    return (
        <Grid container direction="column">
            <Grid>
                <PoliciesTable editPolicies={editPolicies} policies={policies} />
            </Grid>
        </Grid>
    );
};

const PrimaryButton: React.FC<{
    tab: string;
    next: (tab: string) => void;
    isLoading: boolean;
    handleSubmit: () => void;
}> = ({ tab, next, isLoading, handleSubmit }) => {
    if (tab === "general") {
        return <Button onClick={() => next(tab)}>Continue</Button>;
    }
    return (
        <Button type="submit" isLoading={isLoading} onClick={handleSubmit}>
            Create
        </Button>
    );
};

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
                    <Select.Value placeholder="Select a role" />
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

const DrawerLoadPolicies: React.FC<{
    loadPoliciesFromRole: (policies: RbacPolicy[]) => void;
}> = ({ loadPoliciesFromRole }) => {
    const [chosenRole, setChosenRole] = useState<Nullable<RbacRole>>(undefined);
    const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
    return (
        <Drawer open={drawerIsOpen} onOpenChange={setDrawerIsOpen}>
            <Drawer.Trigger asChild>
                <Button>{`Load policies from role`}</Button>
            </Drawer.Trigger>
            <Drawer.Content>
                <Drawer.Header>
                    <Drawer.Title>Select role</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body className="p-4">
                    <Grid container direction="column" columnSpacing={10} rowSpacing={3}>
                        <Grid>
                            <Label>Choose role</Label>
                        </Grid>
                        <Grid>
                            <AvailableRolesList setChosenRole={setChosenRole} />
                        </Grid>
                    </Grid>
                </Drawer.Body>
                <Drawer.Footer>
                    <Drawer.Close asChild>
                        <Button variant="secondary">Cancel</Button>
                    </Drawer.Close>
                    <Button
                        onClick={() => {
                            if (chosenRole) {
                                loadPoliciesFromRole(chosenRole.policies);
                            }
                            setDrawerIsOpen(false);
                        }}
                    >
                        Load
                    </Button>
                </Drawer.Footer>
            </Drawer.Content>
        </Drawer>
    );
};

const CreateRolePoliciesStep: React.FC<{
    configuredPolicies: RbacPolicy[];
    editPolicies: (policies: RbacPolicy[]) => void;
    loadPoliciesFromRole: (policies: RbacPolicy[]) => void;
}> = ({
    configuredPolicies,
    editPolicies,
    loadPoliciesFromRole,
}) => {
        return (
            <Grid container justifyContent="center">
                <Grid size={8}>
                    <Grid container direction="column" spacing={5} marginTop={2}>
                        <Grid container justifyContent="space-between">
                            <Grid container direction="column" spacing={1}>
                                <Grid>
                                    <Heading level="h1">Edit policies</Heading>
                                </Grid>
                                <Grid>
                                    <Text>Define policies for the role</Text>
                                </Grid>
                            </Grid>
                            <Grid>
                                <DrawerLoadPolicies loadPoliciesFromRole={loadPoliciesFromRole} />
                            </Grid>
                        </Grid>
                        <Grid>
                            <PoliciesList
                                editPolicies={editPolicies}
                                policies={configuredPolicies}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    };

const CreateRoleModal: React.FC<{ reloadTable: () => void }> = ({ reloadTable }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setError,
        clearErrors,
        reset,
    } = useForm<{ name: string }>();
    const [activeTab, setActiveTab] = useState(
        "general",
        /* GENERAL */
    );
    const [tabState, setTabState] = useState<Record<string, "not-started" | "in-progress" | "completed">>(initialTabState);
    const [policies, setPolicies] = useState<RbacPolicy[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    function handleEditPolicies(editedPolicies: RbacPolicy[]) {
        const filteredPolicies = policies.filter(
            (policy) =>
                !editedPolicies.some(
                    (ePol) => ePol.permission.id === policy.permission.id,
                ),
        );
        setPolicies(
            [...filteredPolicies, ...editedPolicies].sort((a, b) =>
                `${a.permission.matcher} ${a.permission.actionType}` >
                    `${b.permission.matcher} ${b.permission.actionType}`
                    ? -1
                    : 1,
            ),
        );
    }
    function loadPoliciesFromRole(loadedPolicies: RbacPolicy[]) {
        const filteredPolicies = policies.filter(
            (policy) =>
                !loadedPolicies.some(
                    (ePol) => ePol.permission.id === policy.permission.id,
                ),
        );
        setPolicies(
            [...filteredPolicies, ...loadedPolicies].sort((a, b) =>
                `${a.permission.matcher} ${a.permission.actionType}` >
                    `${b.permission.matcher} ${b.permission.actionType}`
                    ? -1
                    : 1,
            ),
        );
    }
    const partialFormValidation = (tab: string) => {
        switch (tab) {
            case "general":
                if (getValues("name") && getValues.length > 0) {
                    clearErrors("name");
                    return true;
                } else {
                    setError("name", {
                        type: "custom",
                        message: "Please fill the name",
                    });
                    return false;
                }
            default:
                return true;
        }
    };
    useEffect(() => {
        if (!isOpen) {
            reset();
            setActiveTab(
                "general",
                /* GENERAL */
            );
            setTabState(initialTabState);
            setLoading(true);
        }
    }, [isOpen]);
    useEffect(() => {
        if (!isLoading) {
            return;
        }
        sdk.client.fetch<RbacPermission[]>(`/admin/rbac/permissions`, {
        })
            .then((permissions) => {
                const initialPolicies = permissions.map((perm): Omit<RbacPolicy, 'id'> => {
                    return {
                        type: AdminRbacPolicyType.ALLOW,
                        permission: perm,
                    };
                }) as RbacPolicy[];
                setPolicies(
                    initialPolicies.sort((a, b) =>
                        `${a.permission.matcher} ${a.permission.actionType}` >
                            `${b.permission.matcher} ${b.permission.actionType}`
                            ? -1
                            : 1,
                    ),
                );
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [isLoading]);
    const isTabDirty = (tab: string) => {
        return partialFormValidation(tab);
    };
    const onSubmit = (data: { name: string }) => {
        sdk.client.fetch<{ message?: string }>(`/admin/rbac/roles`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: {
                name: data.name,
                policies,
            },
        })
            .then(({ message }) => {
                toast.info("Role", {
                    description: "New role has been created",
                });
                reloadTable();
                setIsOpen(false);
                if (message) {
                    throw message;
                }
            })
            .catch((e) => {
                console.error(e);
            });
    };
    function handleChangeTab(newTab: string) {
        if (activeTab === newTab) {
            return;
        }
        if (tabOrder.indexOf(newTab) < tabOrder.indexOf(activeTab)) {
            const isCurrentTabDirty = isTabDirty(activeTab);
            setTabState((prev) => ({
                ...prev,
                [activeTab]: isCurrentTabDirty ? prev[activeTab] as "not-started" | "in-progress" | "completed" : "not-started",
                [newTab]: "in-progress",
            }));
            setActiveTab(newTab);
            return;
        }
        const tabs = tabOrder.slice(0, tabOrder.indexOf(newTab));
        for (const tab of tabs) {
            if (tab === "general") {
                if (!partialFormValidation(tab)) {
                    setTabState((prev) => ({
                        ...prev,
                        [tab]: "in-progress",
                    }));
                    setActiveTab(tab);
                    return;
                }
                setTabState((prev) => ({
                    ...prev,
                    [tab]: "completed",
                }));
            } else if (tab === "policies") {
                if (!partialFormValidation(tab)) {
                    setTabState((prev) => ({
                        ...prev,
                        [tab]: "in-progress",
                    }));
                    setActiveTab(tab);
                    return;
                }
                setTabState((prev) => ({
                    ...prev,
                    [tab]: "completed",
                }));
            }
        }
        setTabState((prev) => ({
            ...prev,
            [activeTab]: "completed",
            [newTab]: "in-progress",
        }));
        setActiveTab(newTab);
    }
    const handleNextTab = (tab: string) => {
        if (tabOrder.indexOf(tab) + 1 >= tabOrder.length) {
            return;
        }
        const nextTab = tabOrder[tabOrder.indexOf(tab) + 1];
        handleChangeTab(nextTab);
    };
    return (
        <FocusModal open={isOpen} onOpenChange={setIsOpen}>
            <FocusModal.Trigger>
                <Button variant="secondary">Create</Button>
            </FocusModal.Trigger>
            <form>
                <FocusModal.Content>
                    <ProgressTabs
                        value={activeTab}
                        onValueChange={(tab) => handleChangeTab(tab)}
                        className="flex h-full flex-col overflow-hidden"
                    >
                        <FocusModal.Header>
                            <div className="flex w-full items-center justify-between gap-x-4">
                                <div className="-my-2 w-full max-w-[600px] border-l">
                                    <ProgressTabs.List>
                                        <ProgressTabs.Trigger
                                            value="general"
                                            status={tabState.general as "not-started" | "in-progress" | "completed"}
                                        >
                                            General
                                        </ProgressTabs.Trigger>
                                        <ProgressTabs.Trigger
                                            value="policies"
                                            status={tabState.policies as "not-started" | "in-progress" | "completed"}
                                        >
                                            Policies
                                        </ProgressTabs.Trigger>
                                    </ProgressTabs.List>
                                </div>
                            </div>
                        </FocusModal.Header>
                        <FocusModal.Body className="size-full overflow-hidden">
                            <ProgressTabs.Content
                                className="size-full overflow-y-auto"
                                value="general"
                            >
                                <EditRoleStep register={register} errors={errors} />
                            </ProgressTabs.Content>
                            <ProgressTabs.Content
                                className="size-full overflow-y-auto"
                                value="policies"
                            >
                                <CreateRolePoliciesStep
                                    configuredPolicies={policies}
                                    editPolicies={handleEditPolicies}
                                    loadPoliciesFromRole={loadPoliciesFromRole}
                                />
                            </ProgressTabs.Content>
                        </FocusModal.Body>
                        <FocusModal.Footer>
                            <Grid container justifyContent="flex-end">
                                <Grid>
                                    <Grid container columnSpacing={2} rowSpacing={5}>
                                        <Grid>
                                            <FocusModal.Close>
                                                <Button variant="secondary">Cancel</Button>
                                            </FocusModal.Close>
                                        </Grid>
                                        <Grid>
                                            <PrimaryButton
                                                tab={activeTab}
                                                next={handleNextTab}
                                                isLoading={false}
                                                handleSubmit={handleSubmit(onSubmit)}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </FocusModal.Footer>
                    </ProgressTabs>
                </FocusModal.Content>
            </form>
        </FocusModal>
    );
};
const DeleteRole: React.FC<{ roleId: string; setLoading: (loading: boolean) => void }> = ({ roleId, setLoading }) => {
    const handleAction = () => {
        sdk.client.fetch<{ message?: string }>(`/admin/rbac/roles`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: {
                id: roleId,
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
    return (
        <Prompt>
            <Prompt.Trigger onClick={(e) => e.stopPropagation()}>
                <IconButton>
                    <Trash />
                </IconButton>
            </Prompt.Trigger>
            <Prompt.Content>
                <Prompt.Header>
                    <Prompt.Title>Delete role</Prompt.Title>
                    <Prompt.Description>
                        Are you sure? This cannot be undone.
                    </Prompt.Description>
                </Prompt.Header>
                <Prompt.Footer>
                    <Prompt.Cancel onClick={(e) => e.stopPropagation()}>
                        Cancel
                    </Prompt.Cancel>
                    <Prompt.Action
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAction();
                        }}
                    >
                        Delete
                    </Prompt.Action>
                </Prompt.Footer>
            </Prompt.Content>
        </Prompt>
    );
};

function RolesTable$() {
    const [roles, setRoles] = useState<RbacRole[]>([]);
    const [isLoading, setLoading] = useState(true);
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
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 6;
    const pageCount = Math.ceil(roles.length / pageSize);
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
    const currentRoles = useMemo(() => {
        if (isLoading) {
            return [];
        }
        const offset = currentPage * pageSize;
        const limit = Math.min(offset + pageSize, roles.length);
        return roles.slice(offset, limit);
    }, [currentPage, pageSize, roles, isLoading]);
    const navigate = useNavigate();
    const handleRowClick = (id: string) => {
        navigate(`/rbac/roles/${id}`);
    };
    return (
        <Grid container direction="column">
            <Grid>
                <Header
                    title=""
                    actions={[
                        {
                            type: "custom",
                            children: (
                                <CreateRoleModal reloadTable={() => setLoading(true)} />
                            ),
                        },
                    ]}
                />
            </Grid>
            <Grid>
                <div className="flex gap-1 flex-col">
                    <Toaster />
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Name</Table.HeaderCell>
                                <Table.HeaderCell>Policies</Table.HeaderCell>
                                <Table.HeaderCell>Members</Table.HeaderCell>
                                <Table.HeaderCell />
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {currentRoles.map((role) => {
                                return (
                                    <Table.Row
                                        onClick={() => handleRowClick(role.id)}
                                        style={{
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Table.Cell
                                            style={{
                                                alignContent: "center",
                                            }}
                                        >{`${role.name}`}</Table.Cell>
                                        <Table.Cell>
                                            <Grid
                                                container
                                                direction="column"
                                                rowSpacing={1}
                                                paddingTop={1}
                                                paddingBottom={1}
                                            >
                                                <Grid>{`${role.policies.filter((pol) => pol.type === AdminRbacPolicyType.ALLOW).length} allowed`}</Grid>
                                                <Grid>{`${role.policies.filter((pol) => pol.type === AdminRbacPolicyType.DENY).length} denied`}</Grid>
                                            </Grid>
                                        </Table.Cell>
                                        <Table.Cell
                                            style={{
                                                alignContent: "center",
                                            }}
                                        >{`${role.users ? role.users.length : 0} assigned`}</Table.Cell>
                                        <Table.Cell
                                            style={{
                                                alignContent: "center",
                                            }}
                                        >
                                            <Grid container spacing={2}>
                                                <Grid>
                                                    <DeleteRole
                                                        roleId={role.id}
                                                        setLoading={setLoading}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Table.Cell>
                                        {role.id}
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table>
                    <Table.Pagination
                        count={roles.length}
                        pageSize={pageSize}
                        pageIndex={currentPage}
                        pageCount={pageCount}
                        canPreviousPage={canPreviousPage}
                        canNextPage={canNextPage}
                        previousPage={previousPage}
                        nextPage={nextPage}
                    />
                </div>
            </Grid>
        </Grid>
    );
}
export const RolesTable = React.memo(RolesTable$);