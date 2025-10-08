import { clx, Text } from "@medusajs/ui";
import React from "react";


export const SectionRow: React.FC<{
    title: string;
    value?: string | React.ReactNode;
    actions?: React.ReactNode
}> = ({ title, value, actions }) => {
    const isValueString = typeof value === "string" || !value;
    return (
        <div
            className={clx(
                `text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4`,
                {
                    "grid-cols-[1fr_1fr_28px]": !!actions,
                },
            )}
        >
            <Text size="small" weight="plus" leading="compact">
                {title}
            </Text>
            {isValueString ? (
                <Text
                    size="small"
                    leading="compact"
                    className="whitespace-pre-line text-pretty"
                >
                    {value ?? "-"}
                </Text>
            ) : (
                <div className="flex flex-wrap gap-1">{value}</div>
            )}
            {actions && <div>{actions}</div>}
        </div>
    );
};