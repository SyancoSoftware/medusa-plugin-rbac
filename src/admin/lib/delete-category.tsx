import { sdk } from "./sdk";

import { Trash } from "@medusajs/icons";
import { Prompt, IconButton } from "@medusajs/ui";
import { RbacPermissionCategory } from "./types";

export const DeleteCategory: React.FC<{ category: RbacPermissionCategory; reloadTable: () => void }> = ({ category, reloadTable }) => {
    const handleAction = () => {
        sdk.client.fetch<{ message: string }>(`/admin/rbac/categories`, {
            method: "DELETE",
            body: {
                id: category.id,
            },
        })
            .then(({ message }) => {
                reloadTable();
                if (message) {
                    throw message;
                }
            })
            .catch((e) => {
                reloadTable();
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
                    {(category.permissions?.length ?? 0) > 0 && (
                        <Prompt.Title>Eliminar categoría con permisos</Prompt.Title>
                    )}
                    {(category.permissions?.length ?? 0) === 0 && (
                        <Prompt.Title>Eliminar categoría vacía</Prompt.Title>
                    )}
                    {(category.permissions?.length ?? 0) > 0 && (
                        <Prompt.Description>{`¿Estas seguro? Esta categoria contiene ${category.permissions?.length ?? 0} permisos - ¡Ellos también serán eliminados! Esto no se puede deshacer.`}</Prompt.Description>
                    )}
                    {(category.permissions?.length ?? 0) === 0 && (
                        <Prompt.Description>
                            ¿Estás seguro? Esto no se puede deshacer.
                        </Prompt.Description>
                    )}
                </Prompt.Header>
                <Prompt.Footer>
                    <Prompt.Cancel onClick={(e) => e.stopPropagation()}>
                        Cancelar
                    </Prompt.Cancel>
                    <Prompt.Action
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAction();
                        }}
                    >
                        Eliminar
                    </Prompt.Action>
                </Prompt.Footer>
            </Prompt.Content>
        </Prompt>
    );
};