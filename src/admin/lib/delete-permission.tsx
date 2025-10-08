import { sdk } from "./sdk";

import {
    IconButton,
    Prompt,
  } from "@medusajs/ui";
  import React, {  } from "react";
  import {
    Trash,
  } from "@medusajs/icons";

export const DeletePermission: React.FC<{
    permissionId: string;
    reloadTable: () => void;
  }> = ({ permissionId, reloadTable }) => {
    const handleAction = () => {
      sdk.client.fetch<{ message?: string }>(`/admin/rbac/permissions`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          id: permissionId,
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