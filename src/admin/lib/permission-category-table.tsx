import {
    Table
} from "@medusajs/ui";
import React, { useState, useMemo } from "react";
import { Grid } from "./grid";
import { RbacPermissionCategory, PermissionType } from "./types";
import { DeleteCategory } from "./delete-category";

const PermissionCategoryTable$: React.FC<{
    categories: RbacPermissionCategory[];
    permissionType: PermissionType;
    reloadTable: () => void;
}> = ({
    categories,
    permissionType,
    reloadTable,
}) => {
        const [currentPage, setCurrentPage] = useState(0);
        const pageSize = 6;
        const pageCountCategory = Math.ceil(categories.length / pageSize);
        const canNextPage = useMemo(
            () => currentPage < pageCountCategory - 1,
            [currentPage, pageCountCategory],
        );
        const canPreviousPage = useMemo(() => currentPage - 1 >= 0, [currentPage]);
        const nextPage = () => {
            if (canNextPage) {
                setCurrentPage(currentPage + 1);
            }
        };
        const previousPage = () => {
            if (canPreviousPage) {
                setCurrentPage(currentPage - 1);
            }
        };
        const currentCategories = useMemo(() => {
            const offset = currentPage * pageSize;
            const limit = Math.min(offset + pageSize, categories.length);
            return categories.slice(offset, limit);
        }, [currentPage, pageSize, categories]);
        return (
            <div className="flex gap-1 flex-col">
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Categoria</Table.HeaderCell>
                            <Table.HeaderCell>Permisos</Table.HeaderCell>
                            {permissionType === PermissionType.CUSTOM && <Table.HeaderCell />}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {currentCategories.map((category) => {
                            return (
                                <Table.Row key={category.id} className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap">
                                    <Table.Cell>{category.name}</Table.Cell>
                                    <Table.Cell>{category.permissions?.length ?? 0}</Table.Cell>
                                    {permissionType === PermissionType.CUSTOM && (
                                        <Table.Cell>
                                            <Grid container spacing={2}>
                                                <Grid>
                                                    <DeleteCategory
                                                        category={category}
                                                        reloadTable={reloadTable}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Table.Cell>
                                    )}
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
                <Table.Pagination
                    count={categories.length}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    pageCount={pageCountCategory}
                    canPreviousPage={canPreviousPage}
                    canNextPage={canNextPage}
                    previousPage={previousPage}
                    nextPage={nextPage}
                    translations={
                        {
                            results: "resultados",
                            "of": "de",
                            pages: "páginas",
                            prev: "Anterior",
                            next: "Siguiente"
                        }
                    }
                />
            </div>
        );
    };
export const PermissionCategoryTable = React.memo(PermissionCategoryTable$);