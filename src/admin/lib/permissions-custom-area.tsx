import { sdk } from "./sdk";

import {
    Alert,
    Heading,
    Text,
    Button,
    Select,
    Drawer,
    Label,
    Input,
    toast,
    FocusModal,
    ProgressTabs,
    Switch,
} from "@medusajs/ui";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { PermissionActionType, PermissionMatcherType, PermissionType, RbacPermission, RbacPermissionCategory } from "./types";
import { Grid } from "./grid";
import { Header } from "./header";
import { PermissionRecordsTable } from "./permission-records-table";
import { PermissionCategoryTable } from "./permission-category-table";

import { validateName } from "./validateName";
import { LoadingSpinner } from "./loading-spinner";
const PrimaryButton$1: React.FC<{
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

const SelectActionType: React.FC<{
    currentActionType?: PermissionActionType;
    actionTypes: PermissionActionType[];
    setChosenActionType: (actionType: PermissionActionType) => void;
}> = ({
    currentActionType,
    actionTypes,
    setChosenActionType,
}) => {
        const [value, setValue] = useState<PermissionActionType | undefined>(currentActionType);
        const handleChange = (actionType: string) => {
            const typedActionType = actionType as PermissionActionType;
            setValue(typedActionType);
            setChosenActionType(typedActionType);
        };
        return (
            <div className="w-[256px]">
                <Select onValueChange={handleChange} value={value}>
                    <Select.Trigger>
                        <Select.Value placeholder="Select an action type" />
                    </Select.Trigger>
                    <Select.Content>
                        {actionTypes &&
                            actionTypes.map((item) => (
                                <Select.Item value={item}>
                                    {`${item}`}
                                    {item}
                                </Select.Item>
                            ))}
                    </Select.Content>
                </Select>
            </div>
        );
    };

const SelectMatcherType: React.FC<{
    currentMatcherType?: PermissionMatcherType;
    matcherTypes: PermissionMatcherType[];
    setChosenMatcherType: (matcherType: PermissionMatcherType) => void;
}> = ({
    currentMatcherType,
    matcherTypes,
    setChosenMatcherType,
}) => {
        const [value, setValue] = useState<PermissionMatcherType | undefined>(currentMatcherType);
        const handleChange = (matcherType: string) => {
            const typedMatcherType = matcherType as PermissionMatcherType;
            setValue(typedMatcherType);
            setChosenMatcherType(typedMatcherType);
        };
        return (
            <div className="w-[256px]">
                <Select onValueChange={handleChange} value={value}>
                    <Select.Trigger>
                        <Select.Value placeholder="Select a matcher type" />
                    </Select.Trigger>
                    <Select.Content>
                        {matcherTypes &&
                            matcherTypes.map((item) => (
                                <Select.Item value={item}>
                                    {`${item}`}
                                    {item}
                                </Select.Item>
                            ))}
                    </Select.Content>
                </Select>
            </div>
        );
    };

const InputMatcher: React.FC<{ register: any; errors: any }> = ({ register, errors }) => {
    return (
        <Grid container direction="column" spacing={1}>
            <Grid container>
                <Grid>
                    <Grid container direction="column" spacing={1}>
                        <Grid>
                            <Label size="small">Matcher</Label>
                        </Grid>
                        <Grid>
                            <Input
                                placeholder="/admin/products"
                                {...register("matcher", {
                                    validateName: validateName,
                                })}
                                aria-invalid={errors["matcher"] !== undefined}
                            />
                            {errors["matcher"] !== undefined && (
                                <Alert variant="error">{errors["matcher"].message}</Alert>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

const CreatePermissionConfigurationStep: React.FC<{
    register: any;
    errors: any;
    currentMatcherType?: PermissionMatcherType;
    currentActionType?: PermissionActionType;
    setMatcherType: (matcherType: PermissionMatcherType) => void;
    setActionType: (actionType: PermissionActionType) => void;
}> = ({
    register,
    errors,
    currentMatcherType,
    currentActionType,
    setMatcherType,
    setActionType,
}) => {
        return (
            <Grid container justifyContent="center">
                <Grid size={4}>
                    <Grid container direction="column" spacing={1} marginTop={2}>
                        <Grid>
                            <Heading level="h1">Configure permission</Heading>
                        </Grid>
                        <Grid>
                            <Label size="small">Choose matcher type</Label>
                        </Grid>
                        <Grid>
                            <SelectMatcherType
                                currentMatcherType={currentMatcherType}
                                matcherTypes={[PermissionMatcherType.API]}
                                setChosenMatcherType={setMatcherType}
                            />
                        </Grid>
                        <Grid>
                            <Label size="small">Choose action type</Label>
                        </Grid>
                        <Grid>
                            <SelectActionType
                                currentActionType={currentActionType}
                                actionTypes={Object.values(PermissionActionType)}
                                setChosenActionType={setActionType}
                            />
                        </Grid>
                        <Grid>
                            <InputMatcher register={register} errors={errors} />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    };

const initialTabState$1: Record<string, "not-started" | "in-progress" | "completed"> = {
    ["general"]: "in-progress" as const,
    ["configuration"]: "not-started" as const,
};

const tabOrder$1 = [
    "general",
    "configuration",
    /* CONFIGURATION */
];

const InputCreateCategory: React.FC<{
    category?: string;
    setCategory: (value: string) => void;
}> = ({ category, setCategory }) => {
    const [error, _setError] = useState<string | undefined>(undefined);
    return (
        <>
            <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-invalid={error !== undefined}
            />
            {error !== undefined && <Alert variant="error">{error}</Alert>}
        </>
    );
};

const DrawerCreateCategory: React.FC<{ reload: () => void }> = ({ reload }) => {
    const [categoryName, setCategoryName] = useState<string | undefined>(undefined);
    const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
    const onSubmit = () => {
        sdk.client.fetch(`/admin/rbac/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: categoryName,
            }),
        })
            .then(async (response) => {
                if ((response as Response).ok) {
                    reload();
                    toast.info("New category has been created", {
                        description: "You can now select it from the list.",
                    });
                } else {
                    const error = await (response as Response).json();
                    toast.error("Error", {
                        description: `New category cannot be created. ${error.message}`,
                    });
                }
            })
            .catch((e) => {
                toast.error("Error", {
                    description: `New category cannot be created. ${e.toString()}`,
                });
                console.error(e);
            });
    };
    return (
        <Drawer open={drawerIsOpen} onOpenChange={setDrawerIsOpen}>
            <Drawer.Trigger asChild>
                <Button variant="secondary">{`Create`}</Button>
            </Drawer.Trigger>
            <Drawer.Content>
                <Drawer.Header>
                    <Drawer.Title>New category</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                    <Grid container direction="column" columnSpacing={10} rowSpacing={3}>
                        <Grid>
                            <Label>Name</Label>
                        </Grid>
                        <Grid>
                            <InputCreateCategory setCategory={setCategoryName} />
                        </Grid>
                    </Grid>
                </Drawer.Body>
                <Drawer.Footer>
                    <Drawer.Close asChild>
                        <Button variant="secondary">Cancel</Button>
                    </Drawer.Close>
                    <Button
                        onClick={() => {
                            onSubmit();
                            reload();
                            setDrawerIsOpen(false);
                        }}
                    >
                        Save
                    </Button>
                </Drawer.Footer>
            </Drawer.Content>
        </Drawer>
    );
};

const SelectCategory: React.FC<{
    currentCategory?: RbacPermissionCategory | string;
    setChosenCategory: (category: RbacPermissionCategory | string) => void;
}> = ({ currentCategory: _currentCategory, setChosenCategory }) => {
    const [value, setValue] = useState<RbacPermissionCategory | undefined>(undefined);
    const [categories, setCategories] = useState<RbacPermissionCategory[]>([]);
    const handleChange = (categoryId: string) => {
        if (categoryId !== "None") {
            const foundCategory = categories.find((cat) => cat.id == categoryId);
            setValue(foundCategory);
            setChosenCategory(foundCategory || "None");
        } else {
            setValue(undefined);
            setChosenCategory("None");
        }
    };
    const [isLoading, setLoading] = useState(true);
    useEffect(() => {
        if (!isLoading) {
            return;
        }
        sdk.client.fetch(`/admin/rbac/categories`, {
        })
            .then((res) => (res as Response).json())
            .then((result) => {
                setCategories(result);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [isLoading]);
    return (
        <Grid container direction="column" rowSpacing={2}>
            <Grid>
                <Select onValueChange={handleChange} value={value ? value.id : "None"}>
                    <Select.Trigger>
                        <Select.Value placeholder="Select a category" />
                    </Select.Trigger>
                    {isLoading && <LoadingSpinner />}
                    {!isLoading && (
                        <Select.Content>
                            <Select.Item value="None" key="None">
                                None
                            </Select.Item>
                            <Select.Separator />
                            {categories &&
                                categories.map((item) => (
                                    <Select.Item key={item.id} value={item.id}>
                                        {item.name}
                                    </Select.Item>
                                ))}
                        </Select.Content>
                    )}
                </Select>
            </Grid>
            <Grid>
                <Label size="small">You can create new category</Label>
            </Grid>
            <Grid>
                <DrawerCreateCategory reload={() => setLoading(true)} />
            </Grid>
        </Grid>
    );
};

const CreatePermissionGeneralStep: React.FC<{
    register: any;
    errors: any;
    setCategory: (category: RbacPermissionCategory | string) => void;
    currentCategory?: RbacPermissionCategory | string;
}> = ({
    register,
    errors,
    setCategory,
    currentCategory,
}) => {
        return (
            <Grid container justifyContent="center">
                <Grid size={4}>
                    <Grid container direction="column" spacing={1} marginTop={2}>
                        <Grid>
                            <Heading level="h1">Create permission</Heading>
                        </Grid>
                        <Grid>
                            <Text>Set a name which will describe permission</Text>
                        </Grid>
                        <Grid container>
                            <Grid>
                                <Grid container direction="column" spacing={1} marginTop={2}>
                                    <Grid marginTop={4}>
                                        <Label size="small">Name</Label>
                                    </Grid>
                                    <Grid>
                                        <Input
                                            placeholder="Reading products"
                                            {...register("name", {
                                                validateName: validateName,
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
                        <Grid container>
                            <Grid>
                                <Grid container direction="column" spacing={1}>
                                    <Grid marginTop={4}>
                                        <Label size="small">Category (optional)</Label>
                                    </Grid>
                                    <Grid>
                                        <SelectCategory
                                            currentCategory={currentCategory}
                                            setChosenCategory={setCategory}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    };



const CreatePermissionModal: React.FC<{ reloadTable: () => void }> = ({ reloadTable }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setError,
        clearErrors,
        reset,
    } = useForm({
        defaultValues: {
            name: "",
            matcher: "",
        },
    });
    const [activeTab, setActiveTab] = useState(
        "general",
        /* GENERAL */
    );
    const [tabState, setTabState] = useState<Record<string, "not-started" | "in-progress" | "completed">>(initialTabState$1);
    const [isOpen, setIsOpen] = useState(false);
    const [matcherType, setMatcherType] = useState<PermissionMatcherType | undefined>(undefined);
    const [actionType, setActionType] = useState<PermissionActionType | undefined>(undefined);
    const [category, setCategory] = useState<RbacPermissionCategory | string | undefined>(undefined);
    const partialFormValidation = (tab: string) => {
        let result = true;
        switch (tab) {
            case "general":
                if (getValues("name") && getValues.length > 0) {
                    clearErrors("name");
                } else {
                    setError("name", {
                        type: "custom",
                        message: "Please fill the name",
                    });
                    result = false;
                }
                return result;
            case "configuration":
                if (getValues("matcher") && getValues.length > 0) {
                    clearErrors("matcher");
                } else {
                    setError("matcher", {
                        type: "custom",
                        message: "Please fill the matcher",
                    });
                    result = false;
                }
                if (!matcherType) {
                    result = false;
                }
                if (!actionType) {
                    result = false;
                }
                return result;
            default:
                return false;
        }
    };
    useEffect(() => {
        if (!isOpen) {
            reset();
            setActiveTab(
                "general",
                /* GENERAL */
            );
            setMatcherType(undefined);
            setActionType(undefined);
            setCategory(undefined);
            setTabState(initialTabState$1);
        }
    }, [isOpen]);
    const isTabDirty = (tab: string) => {
        return partialFormValidation(tab);
    };
    const onSubmit = (data: { name: string; matcher: string }) => {
        sdk.client.fetch(`/admin/rbac/permissions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: data.name,
                type: PermissionType.CUSTOM,
                matcherType,
                matcher: data.matcher,
                actionType,
                category,
            }),
        })
            .then(async (response) => {
                if ((response as Response).ok) {
                    toast.info("Permission", {
                        description: "New permission has been created",
                    });
                    reloadTable();
                    setIsOpen(false);
                } else {
                    const error = await (response as Response).json();
                    toast.error("Permission", {
                        description: `New permission cannot be created. ${error.message}`,
                    });
                }
            })
            .catch((e) => {
                toast.error("Permission", {
                    description: `New permission cannot be created. ${e.toString()}`,
                });
                console.error(e);
            });
    };
    function handleChangeTab(newTab: string) {
        if (activeTab === newTab) {
            return;
        }
        if (tabOrder$1.indexOf(newTab) < tabOrder$1.indexOf(activeTab)) {
            const isCurrentTabDirty = isTabDirty(activeTab);
            setTabState((prev) => ({
                ...prev,
                [activeTab]: isCurrentTabDirty ? prev[activeTab] as "not-started" | "in-progress" | "completed" : "not-started",
                [newTab]: "in-progress",
            }));
            setActiveTab(newTab);
            return;
        }
        const tabs = tabOrder$1.slice(0, tabOrder$1.indexOf(newTab));
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
            } else if (tab === "configuration") {
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
        if (tabOrder$1.indexOf(tab) + 1 >= tabOrder$1.length) {
            return;
        }
        const nextTab = tabOrder$1[tabOrder$1.indexOf(tab) + 1];
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
                                            value="configuration"
                                            status={tabState.configuration as "not-started" | "in-progress" | "completed"}
                                        >
                                            Configuration
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
                                <CreatePermissionGeneralStep
                                    register={register}
                                    errors={errors}
                                    setCategory={setCategory}
                                    currentCategory={category}
                                />
                            </ProgressTabs.Content>
                            <ProgressTabs.Content
                                className="size-full overflow-y-auto"
                                value="configuration"
                            >
                                <CreatePermissionConfigurationStep
                                    currentMatcherType={matcherType}
                                    currentActionType={actionType}
                                    register={register}
                                    errors={errors}
                                    setActionType={setActionType}
                                    setMatcherType={setMatcherType}
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
                                            <PrimaryButton$1
                                                tab={activeTab}
                                                next={handleNextTab}
                                                isLoading={false}
                                                handleSubmit={() => {
                                                    if (partialFormValidation(activeTab)) {
                                                        return handleSubmit(onSubmit)();
                                                    }
                                                }}
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

export const PermissionsCustomArea = () => {
    const [permissions, setPermissions] = useState<RbacPermission[]>([]);
    const [categories, setCategories] = useState<RbacPermissionCategory[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isLoadingCategories, setLoadingCategories] = useState(true);
    function reloadTable() {
        setLoading(true);
        setLoadingCategories(true);
    }
    const params = new URLSearchParams({
        type: PermissionType.CUSTOM,
    });
    useEffect(() => {
        if (!isLoading) {
            return;
        }
        sdk.client.fetch(`/admin/rbac/permissions?${params.toString()}`, {
        })
            .then((res) => (res as Response).json())
            .then((permissions2) => {
                setPermissions(permissions2);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [isLoading]);
    useEffect(() => {
        if (!isLoadingCategories) {
            return;
        }
        sdk.client.fetch(`/admin/rbac/categories?${params.toString()}`, {
        })
            .then((res) => (res as Response).json())
            .then((categories2) => {
                setCategories(categories2);
                setLoadingCategories(false);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [isLoadingCategories]);
    const [viewType, setViewType] = useState(
        "permission",
        /* PERMISSION */
    );
    return (
        <Grid container direction="column" rowSpacing={3}>
            <Grid>
                <Header
                    title={`Custom`}
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
                        {
                            type: "custom",
                            children: <CreatePermissionModal reloadTable={reloadTable} />,
                        },
                    ]}
                />
            </Grid>
            <Grid>
                {viewType === "permission" ? (
                    <PermissionRecordsTable
                        permissions={permissions}
                        permissionType={PermissionType.CUSTOM}
                        reloadTable={reloadTable}
                    />
                ) : (
                    <PermissionCategoryTable
                        categories={categories}
                        permissionType={PermissionType.CUSTOM}
                        reloadTable={reloadTable}
                    />
                )}
            </Grid>
        </Grid>
    );
};