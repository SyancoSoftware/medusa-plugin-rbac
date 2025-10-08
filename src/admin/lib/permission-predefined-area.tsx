import {
    Text,
    Switch,
} from "@medusajs/ui";
import { useState, useEffect } from "react";
import { Grid } from "./grid";
import { Header } from "./header";
import { LoadingSpinner } from "./loading-spinner";
import { RbacPermission, RbacPermissionCategory, PermissionType } from "./types";
import { PermissionRecordsTable } from "./permission-records-table";
import { PermissionCategoryTable } from "./permission-category-table";

export const PermissionsPredefinedArea = () => {
    const [permissions, setPermissions] = useState<RbacPermission[]>([]);
    const [categories, setCategories] = useState<RbacPermissionCategory[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isLoadingCategories, setLoadingCategories] = useState(true);
    function reloadTable() {
        setLoading(true);
        setLoadingCategories(true);
    }
    const params = new URLSearchParams({
        type: PermissionType.PREDEFINED,
    });
    useEffect(() => {
        if (!isLoading) {
            return;
        }
        fetch(`/admin/rbac/permissions?${params.toString()}`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((permissions2) => {
                setPermissions(permissions2);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [isLoading]);
    useEffect(() => {
        if (!isLoading) {
            return;
        }
        fetch(`/admin/rbac/categories?${params.toString()}`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((categories2) => {
                setCategories(categories2);
                setLoading(false);
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
                    title={`Predefined`}
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
                    ]}
                />
            </Grid>
            {isLoading && (
                <Grid>
                    <LoadingSpinner />
                </Grid>
            )}
            {!isLoading && (
                <Grid>
                    {viewType === "permission" ? (
                        <PermissionRecordsTable
                            permissions={permissions}
                            permissionType={PermissionType.PREDEFINED}
                            reloadTable={reloadTable}
                        />
                    ) : (
                        <PermissionCategoryTable
                            categories={categories}
                            permissionType={PermissionType.PREDEFINED}
                            reloadTable={reloadTable}
                        />
                    )}
                </Grid>
            )}
        </Grid>
    );
};