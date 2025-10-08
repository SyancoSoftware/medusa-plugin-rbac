import {
  Table,
} from "@medusajs/ui";
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Grid } from "./grid";
import { RbacPermission, PermissionType } from "./types";
import { DeletePermission } from "./delete-permission";

const PermissionRecordsTableInner: React.FC<{
  permissions: RbacPermission[];
  permissionType: PermissionType;
  reloadTable: () => void;
}> = ({ permissions, permissionType, reloadTable }) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 6;
  const pageCount = Math.ceil(permissions.length / pageSize);
  const canNextPage = useMemo(
    () => currentPage < pageCount - 1,
    [currentPage, pageCount],
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
  const currentPermissions = useMemo(() => {
    const offset = currentPage * pageSize;
    const limit = Math.min(offset + pageSize, permissions.length);
    return permissions.slice(offset, limit);
  }, [currentPage, pageSize, permissions]);
  const navigate = useNavigate();
  const handleRowClick = (id: string) => {
    navigate(`/rbac/permissions/${id}`);
  };
  return (
    <div className="flex gap-1 flex-col">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Target</Table.HeaderCell>
            <Table.HeaderCell>Action</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
            {permissionType === PermissionType.CUSTOM && <Table.HeaderCell />}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {currentPermissions.map((permission) => {
            return (
              <Table.Row
                key={permission.id}
                onClick={
                  permissionType === PermissionType.CUSTOM
                    ? () => handleRowClick(permission.id)
                    : undefined
                }
                style={
                  permissionType === PermissionType.CUSTOM
                    ? {
                      cursor: "pointer",
                    }
                    : {}
                }
                className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap"
              >
                <Table.Cell
                  style={{
                    alignContent: "center",
                  }}
                >{`${permission.matcher}`}</Table.Cell>
                <Table.Cell
                  style={{
                    alignContent: "center",
                  }}
                >{`${permission.actionType.toUpperCase()}`}</Table.Cell>
                <Table.Cell
                  style={{
                    alignContent: "center",
                  }}
                >
                  {permission.matcherType}
                </Table.Cell>
                <Table.Cell
                  style={{
                    alignContent: "center",
                  }}
                >{`${permission.name}`}</Table.Cell>
                {permissionType === PermissionType.CUSTOM && (
                  <Table.Cell
                    style={{
                      alignContent: "center",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid>
                        <DeletePermission
                          permissionId={permission.id}
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
        count={permissions.length}
        pageSize={pageSize}
        pageIndex={currentPage}
        pageCount={pageCount}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        previousPage={previousPage}
        nextPage={nextPage}
      />
    </div>
  );
};
export const PermissionRecordsTable = React.memo(PermissionRecordsTableInner);