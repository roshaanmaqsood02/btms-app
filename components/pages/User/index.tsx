"use client";

import { useGetUsersQuery } from "@/redux/services/userApi";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  setPage,
  setSearch,
  selectUserQueryParams,
} from "@/redux/slices/userSlice";
import { TableRow, TableCell } from "@/components/ui/table";
import { AppDataTable } from "@/components/common/tableData";
import { SearchBar } from "@/components/common/searchBar";
import { TablePagination } from "@/components/common/pagination";
import { Badge } from "@/components/ui/badge";

export default function User() {
  const dispatch = useAppDispatch();
  const queryParams = useAppSelector(selectUserQueryParams);

  const { data, isLoading, isFetching, error } = useGetUsersQuery(queryParams);

  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / queryParams.limit);

  const columns = ["Name", "Email", "Department", "Projects", "Positions"];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage and view all users in the system
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <SearchBar
          placeholder="Search..."
          value={queryParams.search}
          onChange={(value) => dispatch(setSearch(value))}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            Failed to load users. Please try again.
          </p>
        </div>
      )}

      {/* Data Table */}
      <AppDataTable columns={columns} isLoading={isLoading || isFetching}>
        {data?.data?.map((user) => (
          <TableRow key={user.id}>
            {/* Name Column */}
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span>{user.name}</span>
                {user.gender && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {user.gender}
                  </span>
                )}
              </div>
            </TableCell>

            {/* Email Column */}
            <TableCell>
              <div className="flex flex-col">
                <span>{user.email}</span>
                {user.phone && (
                  <span className="text-xs text-muted-foreground">
                    {user.phone}
                  </span>
                )}
              </div>
            </TableCell>

            {/* Department Column */}
            <TableCell>
              {user.department ? (
                <div className="text-lg font-medium">{user.department}</div>
              ) : (
                <span className="text-sm text-muted-foreground">N/A</span>
              )}
            </TableCell>

            {/* Projects Column */}
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {user.projects && user.projects.length > 0 ? (
                  user.projects.map((project, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      {project}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No projects
                  </span>
                )}
              </div>
            </TableCell>

            {/* Positions Column */}
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {user.positions && user.positions.length > 0 ? (
                  user.positions.map((position, index) => (
                    <Badge
                      key={index}
                      variant="default"
                      className="text-xs font-normal bg-cyan-300 text-black"
                    >
                      {position}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No positions
                  </span>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </AppDataTable>

      {/* Empty State */}
      {!isLoading && !isFetching && data?.data?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No users found
          </p>
          {queryParams.search && (
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search criteria
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <TablePagination
          currentPage={queryParams.page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={queryParams.limit}
          onPageChange={(newPage) => dispatch(setPage(newPage))}
          maxVisiblePages={5}
          showResultsInfo={true}
        />
      )}
    </div>
  );
}
