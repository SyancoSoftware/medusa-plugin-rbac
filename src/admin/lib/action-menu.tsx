import {
    DropdownMenu,
    IconButton,
    clx,
} from "@medusajs/ui";
import React, {  } from "react";
import {
    EllipsisHorizontal,
} from "@medusajs/icons";
import { Link } from "react-router-dom";
import { ActionMenuGroup } from "./types";


export const ActionMenu: React.FC<{ groups: ActionMenuGroup[] }> = ({ groups }) => (
    <DropdownMenu>
        <DropdownMenu.Trigger asChild>
            <IconButton size="small" variant="transparent">
                <EllipsisHorizontal />
            </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
            {groups.map((group, groupIndex) => {
                if (!group.actions.length) {
                    return null;
                }
                const isLastGroup = groupIndex === groups.length - 1;
                return (
                    <DropdownMenu.Group key={`group-${groupIndex}`}>
                        {group.actions.map((action, actionIndex) => {
                            const content = (
                                <>
                                    {action.icon}
                                    <span>{action.label}</span>
                                </>
                            );
                            if (action.onClick) {
                                return (
                                    <DropdownMenu.Item
                                        key={`action-${groupIndex}-${actionIndex}`}
                                        disabled={action.disabled}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            action.onClick?.();
                                        }}
                                        className={clx(
                                            "[&_svg]:text-ui-fg-subtle flex items-center gap-x-2",
                                            {
                                                "[&_svg]:text-ui-fg-disabled": action.disabled,
                                            },
                                        )}
                                    >
                                        {content}
                                    </DropdownMenu.Item>
                                );
                            }

                            if (action.to) {
                                return (
                                    <DropdownMenu.Item
                                        key={`action-${groupIndex}-${actionIndex}`}
                                        className={clx(
                                            "[&_svg]:text-ui-fg-subtle flex items-center gap-x-2",
                                            {
                                                "[&_svg]:text-ui-fg-disabled": action.disabled,
                                            },
                                        )}
                                        asChild
                                        disabled={action.disabled}
                                    >
                                        <Link to={action.to} onClick={(e) => e.stopPropagation()}>
                                            {content}
                                        </Link>
                                    </DropdownMenu.Item>
                                );
                            }

                            return (
                                <DropdownMenu.Item
                                    key={`action-${groupIndex}-${actionIndex}`}
                                    disabled={action.disabled}
                                    className={clx(
                                        "[&_svg]:text-ui-fg-subtle flex items-center gap-x-2",
                                        {
                                            "[&_svg]:text-ui-fg-disabled": action.disabled,
                                        },
                                    )}
                                >
                                    {content}
                                </DropdownMenu.Item>
                            );
                        })}
                        {!isLastGroup && <DropdownMenu.Separator />}
                    </DropdownMenu.Group>
                );
            })}
        </DropdownMenu.Content>
    </DropdownMenu>
);
