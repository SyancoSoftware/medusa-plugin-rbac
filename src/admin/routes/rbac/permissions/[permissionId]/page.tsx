import {
    Container,
    Alert,
    Button,
    Drawer,
    Label,
    Input,
    Select,
    Text,
    toast,
} from "@medusajs/ui";
import React, { useState, useEffect } from "react";
import {
    Pencil,
} from "@medusajs/icons";
import { useParams } from "react-router-dom";
import { Grid, LoadingSpinner, RbacPermission, RbacPermissionCategory, PermissionActionType, PermissionMatcherType, sdk } from "../../../../lib";
import { Header } from "../../../../lib/header";
import { SectionRow } from "../../../../lib/section-row";


const SingleColumnLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <div className="flex flex-col gap-y-3">{children}</div>;
};


const DrawerEditPermissionGeneral: React.FC<{
    drawerIsOpen: boolean;
    setDrawerIsOpen: (open: boolean) => void;
    currentPermission: RbacPermission;
    categories: RbacPermissionCategory[];
    setPermission: (permission: RbacPermission) => void;
}> = ({
    drawerIsOpen,
    setDrawerIsOpen,
    currentPermission,
    categories,
    setPermission,
}) => {
        const [error, setError] = useState<string | undefined>(undefined);
        const [name, setName] = useState(currentPermission.name);
        const [matcher, setMatcher] = useState(currentPermission.matcher);
        const [matcherType, setMatcherType] = useState<PermissionMatcherType>(currentPermission.matcherType);
        const [actionType, setActionType] = useState<PermissionActionType>(currentPermission.actionType);
        const [categoryId, setCategoryId] = useState<string | undefined>(currentPermission.category?.id);

        function validateName2(value: string) {
            if (value && value.length > 0) {
                setError(undefined);
                return true;
            }
            setError("El nombre es obligatorio");
            return false;
        }
        function validateMatcher(value: string) {
            if (value && value.length > 0) {
                setError(undefined);
                return true;
            }
            setError("El matcher es obligatorio");
            return false;
        }
        useEffect(() => {
            setError(undefined);
            setName(currentPermission.name);
            setMatcher(currentPermission.matcher);
            setMatcherType(currentPermission.matcherType);
            setActionType(currentPermission.actionType);
            setCategoryId(currentPermission.category?.id);
        }, [drawerIsOpen, currentPermission]);
        return (
            <Drawer open={drawerIsOpen} onOpenChange={setDrawerIsOpen}>
                <Drawer.Content>
                    <Drawer.Header>
                        <Drawer.Title>Editar permiso</Drawer.Title>
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
                            <Grid>
                                <Label>Tipo de coincidencia</Label>
                            </Grid>
                            <Grid>
                                <Select value={matcherType} onValueChange={(value) => setMatcherType(value as PermissionMatcherType)}>
                                    <Select.Trigger>
                                        <Select.Value placeholder="Seleccionar tipo" />
                                    </Select.Trigger>
                                    <Select.Content>
                                        {Object.values(PermissionMatcherType).map((type) => (
                                            <Select.Item key={type} value={type}>
                                                {type}
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select>
                            </Grid>
                            <Grid>
                                <Label>Matcher</Label>
                            </Grid>
                            <Grid>
                                <Input
                                    value={matcher}
                                    placeholder="/admin/products"
                                    onChange={(e) => {
                                        setMatcher(e.target.value);
                                        validateMatcher(e.target.value);
                                    }}
                                    aria-invalid={error !== undefined}
                                />
                                {error !== undefined && <Alert variant="error">{error}</Alert>}
                            </Grid>
                            <Grid>
                                <Label>Tipo de acción</Label>
                            </Grid>
                            <Grid>
                                <Select value={actionType} onValueChange={(value) => setActionType(value as PermissionActionType)}>
                                    <Select.Trigger>
                                        <Select.Value placeholder="Seleccionar acción" />
                                    </Select.Trigger>
                                    <Select.Content>
                                        {Object.values(PermissionActionType).map((type) => (
                                            <Select.Item key={type} value={type}>
                                                {type}
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select>
                            </Grid>
                            <Grid>
                                <Label>Categoría</Label>
                            </Grid>
                            <Grid>
                                <Select
                                    value={categoryId ?? "none"}
                                    onValueChange={(value) =>
                                        setCategoryId(value === "none" ? undefined : value)
                                    }
                                >
                                    <Select.Trigger>
                                        <Select.Value placeholder="Seleccionar categoría" />
                                    </Select.Trigger>
                                    <Select.Content>
                                        <Select.Item value="none">Ninguna</Select.Item>
                                        <Select.Separator />
                                        {categories.map((cat) => (
                                            <Select.Item key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select>
                                <Text size="small">Elija una categoría o deje sin seleccionar.</Text>
                            </Grid>
                        </Grid>
                    </Drawer.Body>
                    <Drawer.Footer>
                        <Drawer.Close asChild>
                            <Button variant="secondary">Cancelar</Button>
                        </Drawer.Close>
                        <Button
                            disabled={
                                error !== undefined ||
                                !name ||
                                !matcher ||
                                !matcherType ||
                                !actionType
                            }
                            onClick={() => {
                                if (!error && name && matcher && matcherType && actionType) {
                                    setPermission({
                                        ...currentPermission,
                                        name,
                                        matcher,
                                        matcherType,
                                        actionType,
                                        category: categoryId ? { id: categoryId } : null,
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

const RbacPermissionGeneral: React.FC<{
    rbacPermission: RbacPermission;
    reloadTable: () => void;
    categories: RbacPermissionCategory[];
}> = ({ rbacPermission, reloadTable, categories }) => {
    const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
    function updatePermission(permission: RbacPermission) {
        sdk.client.fetch<{ message: string }>(`/admin/rbac/permissions/${permission.id}`, {
            method: "POST",
            body: permission,
        })
            .then(({ message }) => {
                reloadTable();
                setDrawerIsOpen(false);
                if (message) {
                    toast.error("Error al actualizar el permiso", {
                        description: message,
                    });
                    throw message;
                }
                toast.success("Permiso actualizado");
            })
            .catch((e) => {
                reloadTable();
                setDrawerIsOpen(false);
                toast.error("Error al actualizar el permiso", {
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
            <DrawerEditPermissionGeneral
                drawerIsOpen={drawerIsOpen}
                setDrawerIsOpen={setDrawerIsOpen}
                currentPermission={rbacPermission}
                categories={categories}
                setPermission={updatePermission}
            />
            <SectionRow title="Nombre" value={rbacPermission.name} />
            <SectionRow title="Tipo" value={rbacPermission.type} />
            <SectionRow title="Tipo de coincidencia" value={rbacPermission.matcherType} />
            <SectionRow title="Tipo de accion" value={rbacPermission.actionType} />
            <SectionRow
                title="Categoria"
                value={rbacPermission.category ? rbacPermission.category.name : "-"}
            />
        </Container>
    );
};

export const RbacPermissionPage = () => {
    const { permissionId } = useParams();
    const [permission, setPermission] = useState<RbacPermission | undefined>(undefined);
    const [isLoading, setLoading] = useState(true);
    const [categories, setCategories] = useState<RbacPermissionCategory[]>([]);
    const [isLoadingCategories, setLoadingCategories] = useState(true);
    useEffect(() => {
        if (!isLoading) {
            return;
        }
        sdk.client.fetch<{ permission: RbacPermission }>(`/admin/rbac/permissions/${permissionId}`)
            .then((result) => {
                setPermission({
                    ...result.permission,
                });
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, [isLoading]);
    useEffect(() => {
        if (!isLoadingCategories) {
            return;
        }
        sdk.client.fetch<RbacPermissionCategory[]>(`/admin/rbac/categories`)
            .then((result) => {
                setCategories(result);
                setLoadingCategories(false);
            })
            .catch((error) => {
                console.error(error);
                setLoadingCategories(false);
            });
    }, [isLoadingCategories]);
    if (isLoading || !permission || isLoadingCategories) {
        return <LoadingSpinner />;
    }
    return (
        <SingleColumnLayout>
            <RbacPermissionGeneral
                rbacPermission={permission}
                reloadTable={() => setLoading(true)}
                categories={categories}
            />
        </SingleColumnLayout>
    );
};

export default RbacPermissionPage;
