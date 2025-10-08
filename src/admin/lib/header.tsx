import { Heading, Text, Button } from "@medusajs/ui";
import React from "react";
import { HeaderAction } from "./types";
import { ActionMenu } from "./action-menu";
import { Link } from "react-router-dom";

export const Header: React.FC<{
    title: string;
    subtitle?: string;
    actions?: HeaderAction[];
}> = ({ title, subtitle, actions = [] }) => (
    <div className="flex items-center justify-between px-6 py-4">
        <div>
            <Heading level="h2">{title}</Heading>
            {subtitle && (
                <Text className="text-ui-fg-subtle" size="small">
                    {subtitle}
                </Text>
            )}
        </div>
        {actions.length > 0 && (
            <div className="flex items-center justify-center gap-x-2">
                {actions.map((action, index) => {
                    const key = `${action.type}-${index}`;

                    if (action.type === "button") {
                        const { link, children, size, ...buttonProps } = action.props;
                        return (
                            <Button
                                key={key}
                                size={size ?? "small"}
                                {...buttonProps}
                                onClick={buttonProps.onClick}
                            >
                                {children}
                                {link ? <Link {...link} /> : null}
                            </Button>
                        );
                    }

                    if (action.type === "action-menu") {
                        return <ActionMenu key={key} {...action.props} />;
                    }

                    return (
                        <React.Fragment key={key}>{action.children}</React.Fragment>
                    );
                })}
            </div>
        )}
    </div>
);