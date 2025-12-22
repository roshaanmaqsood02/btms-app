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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { useState, useCallback, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye, MoreVertical, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserDetailSidebar from "@/components/common/ui/UserDetailSidebar";
import {
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/redux/services/userApi";

export default function User() {
  const dispatch = useAppDispatch();

  // Get query params with defaults
  const queryParams = useAppSelector(selectUserQueryParams) || {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc" as const,
  };

  // Ensure all required parameters are present
  const safeQueryParams = {
    page: queryParams.page || 1,
    limit: queryParams.limit || 10,
    search: queryParams.search || "",
    sortBy: queryParams.sortBy || "createdAt",
    sortOrder: queryParams.sortOrder || "desc",
    isActive: queryParams.isActive,
  };

  const { data, isLoading, isFetching, error, refetch } =
    useGetUsersQuery(safeQueryParams);
  const currentUser = useAppSelector(selectCurrentUser);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Sidebar state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / safeQueryParams.limit);

  const columns = [
    "EMP ID",
    "ATT ID",
    "NAME",
    "EMAIL",
    "DEPARTMENT",
    "PROJECTS",
    "POSITIONS",
    "ACTIONS",
  ];

  // Get initials for avatar fallback
  const getInitials = (name?: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "U";

  // Construct profile picture URL with cache-busting query parameter
  const getProfilePicUrl = (user: any) => {
    if (!user?.profilePic) return "";

    // If backend already returned full URL, use it
    if (user.profilePic.startsWith("http")) {
      return `${user.profilePic}?v=${Date.now()}`;
    }

    // Fallback to env URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    // Ensure no double slashes
    return `${baseUrl}/${user.profilePic.replace(/^\/+/, "")}?v=${Date.now()}`;
  };

  // Handle view user details
  const handleViewUser = useCallback((user: any) => {
    setSelectedUserId(user.id);
    setSelectedUserData(user);
  }, []);

  // Handle close sidebar
  const handleCloseSidebar = useCallback(() => {
    setSelectedUserId(null);
    setSelectedUserData(null);
  }, []);

  // Handle edit user - show toast for now
  const handleEditUser = useCallback(() => {
    if (!selectedUserId || !selectedUserData) return;
    toast.info("Edit functionality coming soon!", {
      description: `Editing user: ${selectedUserData?.name}`,
    });
  }, [selectedUserId, selectedUserData]);

  // Handle update user - implement when you have edit form
  const handleUpdateUser = useCallback(
    async (updatedData: any) => {
      if (!selectedUserId) return;

      try {
        await updateUser({
          id: selectedUserId,
          data: updatedData,
        }).unwrap();

        toast.success("User updated successfully");
        refetch();
      } catch (error: any) {
        toast.error("Failed to update user", {
          description: error?.data?.message || "Please try again later",
        });
      }
    },
    [selectedUserId, updateUser, refetch]
  );

  // Handle delete confirmation
  const handleDeleteClick = useCallback((user: any) => {
    setUserToDelete({ id: user.id, name: user.name });
    setIsDeleteDialogOpen(true);
  }, []);

  // Handle actual delete
  const handleDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id).unwrap();

      toast.success("User deleted successfully", {
        description: `User "${userToDelete.name}" has been removed from the system`,
      });

      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      handleCloseSidebar();
      refetch();
    } catch (error: any) {
      if (error?.status === 403) {
        toast.error("Permission denied", {
          description: error?.data?.message || "Only HRM can delete users",
        });
      } else if (error?.status === 404) {
        toast.error("User not found", {
          description: "The user may have already been deleted",
        });
      } else {
        toast.error("Failed to delete user", {
          description: error?.data?.message || "Please try again later",
        });
      }
    }
  }, [userToDelete, deleteUser, refetch, handleCloseSidebar]);

  // Handle sidebar delete
  const handleSidebarDelete = useCallback(() => {
    if (!selectedUserId || !selectedUserData) return;
    handleDeleteClick(selectedUserData);
  }, [selectedUserId, selectedUserData, handleDeleteClick]);

  // Check if current user has admin privileges
  const hasAdminAccess =
    currentUser?.systemRole === "HRM" ||
    currentUser?.systemRole === "OPERATION_MANAGER";

  return (
    <div className="relative min-h-screen">
      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SearchBar
            placeholder="Search users by name, email, or department..."
            value={safeQueryParams.search}
            onChange={(value) => dispatch(setSearch(value))}
            className="max-w-lg"
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">
              Failed to load users. Please try again.
            </p>
          </div>
        )}

        {/* Data Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <AppDataTable
            columns={columns}
            isLoading={isLoading || isFetching}
            emptyState={
              !isLoading && !isFetching && data?.data?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-lg font-medium text-muted-foreground">
                    No users found
                  </p>
                  {safeQueryParams.search && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Try adjusting your search criteria
                    </p>
                  )}
                </div>
              ) : null
            }
          >
            {data?.data?.map((user) => (
              <TableRow
                key={user.id}
                className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                onClick={() => handleViewUser(user)}
              >
                {/* EMP ID */}
                <TableCell>
                  <div className="font-medium text-gray-900">
                    {user.employeeId || (
                      <span className="text-sm text-gray-400">
                        Not assigned
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* ATT ID */}
                <TableCell>
                  <div className="font-medium text-gray-900">
                    {user.attendanceId || (
                      <span className="text-sm text-gray-400">
                        Not assigned
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Name Column */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-gray-100">
                      {user?.profilePic && (
                        <AvatarImage
                          src={getProfilePicUrl(user)}
                          alt={user?.name || "User"}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                      {user.systemRole && (
                        <Badge
                          variant="outline"
                          className="text-xs font-normal mt-1 w-fit bg-gray-50"
                        >
                          {user.systemRole.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Email Column */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-gray-900">{user.email}</span>
                    {user.phone && (
                      <span className="text-xs text-gray-500 mt-1">
                        {user.phone}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Department Column */}
                <TableCell>
                  {user.department ? (
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {user.department}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-400">N/A</span>
                  )}
                </TableCell>

                {/* Projects Column */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.projects && user.projects.length > 0 ? (
                      <>
                        {user.projects.slice(0, 2).map((project, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs font-medium bg-green-50 text-green-700 border-green-200"
                          >
                            {project}
                          </Badge>
                        ))}
                        {user.projects.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.projects.length - 2} more
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">No projects</span>
                    )}
                  </div>
                </TableCell>

                {/* Positions Column */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.positions && user.positions.length > 0 ? (
                      <>
                        {user.positions.slice(0, 2).map((position, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs font-medium bg-cyan-50 text-cyan-700 border-cyan-200"
                          >
                            {position}
                          </Badge>
                        ))}
                        {user.positions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.positions.length - 2} more
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">
                        No positions
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Actions Column */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleViewUser(user)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>

                      {/* Show edit only for HRM and Operation Manager */}
                      {hasAdminAccess && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser();
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                      )}

                      {/* Show delete only for HRM */}
                      {currentUser?.systemRole === "HRM" && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(user);
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </AppDataTable>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <TablePagination
            currentPage={safeQueryParams.page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={safeQueryParams.limit}
            onPageChange={(newPage) => dispatch(setPage(newPage))}
            maxVisiblePages={5}
            showResultsInfo={true}
          />
        )}
      </div>

      {/* User Detail Sidebar */}
      <UserDetailSidebar
        selectedUserId={selectedUserId}
        selectedUserData={selectedUserData}
        onClose={handleCloseSidebar}
        onEdit={handleEditUser}
        onDelete={handleSidebarDelete}
        isLoading={isFetching}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {userToDelete?.name}
              </span>
              ? This action cannot be undone. All user data, including
              assignments and history, will be permanently removed from the
              system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
