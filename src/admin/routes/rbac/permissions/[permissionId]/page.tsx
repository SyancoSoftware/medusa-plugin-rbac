import {
    Container,
    Alert,
    Button,
    Drawer,
    Label,
    Input,
} from "@medusajs/ui";
import React, { useState, useEffect } from "react";
import {
    Pencil,
} from "@medusajs/icons";
import { useParams } from "react-router-dom";
import { Grid, LoadingSpinner, RbacPermission, sdk } from "../../../../lib";
import { Header } from "../../../../lib/header";
import { SectionRow } from "../../../../lib/section-row";


const SingleColumnLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <div className="flex flex-col gap-y-3">{children}</div>;
};


const DrawerEditPermissionGeneral: React.FC<{
    drawerIsOpen: boolean;
    setDrawerIsOpen: (open: boolean) => void;
    currentPermission: RbacPermission;
    setPermission: (permission: RbacPermission) => void;
}> = ({
    drawerIsOpen,
    setDrawerIsOpen,
    currentPermission,
    setPermission,
}) => {
        const [error, setError] = useState<string | undefined>(undefined);
        const [name, setName] = useState(currentPermission.name);
        function validateName2(value: string) {
            if (value && value.length > 0) {
                setError(undefined);
                return true;
            }
            setError("El nombre es obligatorio");
            return false;
        }
        useEffect(() => {
            setError(undefined);
        }, [drawerIsOpen]);
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
                                    setPermission({
                                        ...currentPermission,
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

const RbacPermissionGeneral: React.FC<{
    rbacPermission: RbacPermission;
    reloadTable: () => void
}> = ({ rbacPermission, reloadTable }) => {
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
            });
    }, [isLoading]);
    if (isLoading || !permission) {
        return <LoadingSpinner />;
    }
    return (
        <SingleColumnLayout>
            <RbacPermissionGeneral
                rbacPermission={permission}
                reloadTable={() => setLoading(true)}
            />
        </SingleColumnLayout>
    );
};