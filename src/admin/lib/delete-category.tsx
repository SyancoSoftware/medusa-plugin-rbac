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
                        <Prompt.Title>Delete category with permissions</Prompt.Title>
                    )}
                    {(category.permissions?.length ?? 0) === 0 && (
                        <Prompt.Title>Delete empty category</Prompt.Title>
                    )}
                    {(category.permissions?.length ?? 0) > 0 && (
                        <Prompt.Description>{`Are you sure? This category contains ${category.permissions?.length ?? 0} permissions - they will be deleted also! This cannot be undone.`}</Prompt.Description>
                    )}
                    {(category.permissions?.length ?? 0) === 0 && (
                        <Prompt.Description>
                            Are you sure? This cannot be undone.
                        </Prompt.Description>
                    )}
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