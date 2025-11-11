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
        return <Button onClick={() => next(tab)}>Continuar</Button>;
    }
    return (
        <Button type="submit" isLoading={isLoading} onClick={handleSubmit}>
            Crear
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
                        <Select.Value placeholder="Seleccionar un tipo de accion" />
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
                        <Select.Value placeholder="Seleccione un tipo de coincidencia" />
                    </Select.Trigger>
                    <Select.Content>
                        {matcherTypes &&
                            matcherTypes.map((item) => (
                                <Select.Item value={item}>
                                    {`${item}`}{" "}
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
                            <Label size="small">Comparador</Label>
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
                            <Heading level="h1">Configurar permisos</Heading>
                        </Grid>
                        <Grid>
                            <Label size="small">Seleccione un tipo de coincidencia</Label>
                        </Grid>
                        <Grid>
                            <SelectMatcherType
                                currentMatcherType={currentMatcherType}
                                matcherTypes={[PermissionMatcherType.API]}
                                setChosenMatcherType={setMatcherType}
                            />
                        </Grid>
                        <Grid>
                            <Label size="small">Seleccione el tipo de acción</Label>
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
        sdk.client.fetch<{ ok: boolean; message?: string }>(`/admin/rbac/categories`, {
            method: "POST",
            body: {
                name: categoryName,
            },
        })
            .then(async (response) => {
                if (response.ok) {
                    reload();
                    toast.info("Se ha creado una nueva categoría.", {
                        description: "Ahora puedes seleccionarlo de la lista.",
                    });
                } else {
                    toast.error("Error", {
                        description: `No se puede crear una nueva categoría.. ${response.message}`,
                    });
                }
            })
            .catch((e) => {
                toast.error("Error", {
                    description: `No se puede crear una nueva categoría.. ${e.toString()}`,
                });
                console.error(e);
            });
    };
    return (
        <Drawer open={drawerIsOpen} onOpenChange={setDrawerIsOpen}>
            <Drawer.Trigger asChild>
                <Button variant="secondary">{`Crear`}</Button>
            </Drawer.Trigger>
            <Drawer.Content>
                <Drawer.Header>
                    <Drawer.Title>Nueva categoria</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                    <Grid container direction="column" columnSpacing={10} rowSpacing={3}>
                        <Grid>
                            <Label>Nombre</Label>
                        </Grid>
                        <Grid>
                            <InputCreateCategory setCategory={setCategoryName} />
                        </Grid>
                    </Grid>
                </Drawer.Body>
                <Drawer.Footer>
                    <Drawer.Close asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </Drawer.Close>
                    <Button
                        onClick={() => {
                            onSubmit();
                            reload();
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
        sdk.client.fetch<RbacPermissionCategory[]>(`/admin/rbac/categories`, {
        })
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
                        <Select.Value placeholder="Seleccionar categoria" />
                    </Select.Trigger>
                    {isLoading && <LoadingSpinner />}
                    {!isLoading && (
                        <Select.Content>
                            <Select.Item value="None" key="None">
                                Ninguna
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
                <Label size="small">Puedes crear una nueva categoría</Label>
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
                            <Heading level="h1">Crear permiso</Heading>
                        </Grid>
                        <Grid>
                            <Text>Asigna un nombre que describa el permiso.</Text>
                        </Grid>
                        <Grid container>
                            <Grid>
                                <Grid container direction="column" spacing={1} marginTop={2}>
                                    <Grid marginTop={4}>
                                        <Label size="small">Nombre</Label>
                                    </Grid>
                                    <Grid>
                                        <Input
                                            placeholder="Listar articulos"
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
                                        <Label size="small">Categoria (opcional)</Label>
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
                        message: "Por favor, escriba el nombre",
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
                        message: "Por favor, seleccione el comparador",
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
        sdk.client.fetch<{ ok: boolean; message?: string }>(`/admin/rbac/permissions`, {
            method: "POST",
            body: {
                name: data.name,
                type: PermissionType.CUSTOM,
                matcherType,
                matcher: data.matcher,
                actionType,
                category,
            }
        })
            .then(async (response) => {
                if (response.ok) {
                    toast.info("Permiso", {
                        description: "Se ha creado un nuevo permiso.",
                    });
                    reloadTable();
                    setIsOpen(false);
                } else {
                    toast.error("Permiso", {
                        description: `No se pudo crear el nuevo permiso. ${response.message}`,
                    });
                }
            })
            .catch((e) => {
                toast.error("Permiso", {
                    description: `No se pudo crear el nuevo permiso. ${e.toString()}`,
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
                <Button variant="secondary">Crear</Button>
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
                                            Configuracion
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
                                                <Button variant="secondary">Cancelar</Button>
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
        sdk.client.fetch<RbacPermission[]>(`/admin/rbac/permissions?${params.toString()}`, {
        })
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
        sdk.client.fetch<RbacPermissionCategory[]>(`/admin/rbac/categories?${params.toString()}`, {
        })
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
                    title={`Personalizado`}
                    actions={[
                        {
                            type: "custom",
                            children: (
                                <Grid container paddingRight={5} spacing={2}>
                                    <Grid>
                                        <Text>
                                            {viewType === "category"
                                                ? "Vista de categoria"
                                                : "Vista de permiso"}
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