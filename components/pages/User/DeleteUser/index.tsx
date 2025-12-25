"use client";

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
import { useDeleteUserMutation } from "@/redux/services/userApi";
import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToDelete: { id: string; name: string; systemRole?: string } | null;
  onDeleteSuccess?: () => void;
  currentUserRole?: string;
  currentUserId?: string;
}

export default function DeleteUserDialog({
  open,
  onOpenChange,
  userToDelete,
  onDeleteSuccess,
  currentUserRole,
  currentUserId,
}: DeleteUserDialogProps) {
  const router = useRouter();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [password, setPassword] = useState<string>("");
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);

  // Reset password when dialog opens/closes
  useEffect(() => {
    if (open) {
      setPassword("");
      // Determine if password input should be shown
      // Only HRM needs password, ADMIN doesn't
      setShowPasswordInput(currentUserRole === "HRM");
    }
  }, [open, currentUserRole]);

  // Check if current user can delete this specific user
  const canDeleteUser = useCallback(() => {
    if (!currentUserRole || !userToDelete) return false;

    // Cannot delete yourself from user list (self-deletion goes through profile page)
    if (currentUserId === userToDelete.id) return false;

    // ADMIN can delete anyone
    if (currentUserRole === "ADMIN") return true;

    // HRM can delete most users with restrictions
    if (currentUserRole === "HRM") {
      // HRM cannot delete ADMIN, other HRM, or Operation Managers
      return !(
        userToDelete.systemRole === "ADMIN" ||
        userToDelete.systemRole === "HRM" ||
        userToDelete.systemRole === "OPERATION_MANAGER"
      );
    }

    return false;
  }, [currentUserRole, userToDelete, currentUserId]);

  const handleDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    // Check if user has permission
    if (!canDeleteUser()) {
      let errorMessage = "You do not have permission to delete this user";

      if (currentUserRole === "HRM" && userToDelete.systemRole) {
        if (
          userToDelete.systemRole === "ADMIN" ||
          userToDelete.systemRole === "HRM" ||
          userToDelete.systemRole === "OPERATION_MANAGER"
        ) {
          errorMessage = "HRM cannot delete ADMIN, HRM, or Operation Managers";
        }
      } else if (currentUserId === userToDelete.id) {
        errorMessage =
          "You cannot delete your own account from here. Use profile settings.";
      }

      toast.error("Permission denied", {
        description: errorMessage,
      });
      return;
    }

    // For HRM, require password confirmation
    if (currentUserRole === "HRM" && !password.trim()) {
      toast.error("Password required", {
        description: "Please enter your password to confirm deletion",
      });
      return;
    }

    try {
      // Prepare deletion data
      let deleteData: any;

      if (currentUserRole === "HRM") {
        // HRM needs to send password in body
        deleteData = {
          userId: userToDelete.id,
          password: password,
        };
      } else if (currentUserRole === "ADMIN") {
        // ADMIN can delete directly without password
        deleteData = {
          userId: userToDelete.id,
        };
      }

      console.log("Deleting user with data:", deleteData);

      // Call the mutation - this should match your RTK query endpoint
      const result = await deleteUser(userToDelete.id).unwrap();
      // OR if your endpoint expects body:
      // const result = await deleteUser(deleteData).unwrap();

      console.log("Delete result:", result);

      toast.success("User deleted successfully", {
        description: `User "${userToDelete.name}" has been removed from the system`,
      });

      // Reset form
      setPassword("");
      setShowPasswordInput(false);
      onOpenChange(false);

      // Call the success callback if provided
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }

      // Refresh the page to update the list
      router.refresh();
    } catch (error: any) {
      console.error("Delete error:", error);
      // Reset password on error
      setPassword("");

      if (error?.status === 403) {
        toast.error("Permission denied", {
          description:
            error?.data?.message ||
            "You don't have permission to delete this user",
        });
      } else if (error?.status === 401) {
        toast.error("Authentication failed", {
          description: "Invalid password. Please try again.",
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
  }, [
    userToDelete,
    deleteUser,
    currentUserRole,
    currentUserId,
    password,
    canDeleteUser,
    onOpenChange,
    onDeleteSuccess,
    router,
  ]);

  // Get warning message based on user role
  const getWarningMessage = () => {
    if (!userToDelete) return "";

    if (currentUserRole === "ADMIN") {
      return `You are deleting as ADMIN. This action will permanently delete ${userToDelete.name}'s account and all associated data.`;
    } else if (currentUserRole === "HRM") {
      return `You are deleting as HRM. This action will permanently delete ${userToDelete.name}'s account. Please confirm with your password.`;
    }

    return `This action will permanently delete ${userToDelete.name}'s account and all associated data.`;
  };

  // Get user role display name
  const getUserRoleDisplay = (role?: string) => {
    if (!role) return "User";

    const roleNames: Record<string, string> = {
      EMPLOYEE: "Employee",
      PROJECT_MANAGER: "Project Manager",
      OPERATION_MANAGER: "Operation Manager",
      HRM: "HR Manager",
      ADMIN: "Admin",
    };

    return roleNames[role] || role;
  };

  if (!userToDelete) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            Delete User Account
          </AlertDialogTitle>

          {/* User info */}
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  {userToDelete.name}
                </p>
                {userToDelete.systemRole && (
                  <p className="text-sm text-gray-600">
                    Role:{" "}
                    <span className="font-medium">
                      {getUserRoleDisplay(userToDelete.systemRole)}
                    </span>
                  </p>
                )}
              </div>
              {currentUserRole === "ADMIN" && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                  ADMIN DELETE
                </span>
              )}
            </div>
          </div>

          <AlertDialogDescription>{getWarningMessage()}</AlertDialogDescription>
        </AlertDialogHeader>

        {/* Content outside AlertDialogDescription to avoid nesting issues */}
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Warning:</strong> This action cannot be undone. All
                  user data including:
                </p>
                <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                  <li>Profile information</li>
                  <li>Project assignments</li>
                  <li>Attendance records</li>
                  <li>All related history</li>
                </ul>
                <p className="text-sm text-yellow-700 mt-2">
                  will be permanently removed from the system.
                </p>
              </div>
            </div>
          </div>

          {/* Password input for HRM */}
          {showPasswordInput && currentUserRole === "HRM" && (
            <div>
              <Label htmlFor="password" className="text-gray-700">
                Confirm your password to proceed
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1"
                autoComplete="current-password"
              />
              <p className="text-xs text-gray-500 mt-1">
                Required for HRM to confirm deletion
              </p>
            </div>
          )}

          {/* Admin confirmation message */}
          {currentUserRole === "ADMIN" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ ADMIN PRIVILEGE: No password required for ADMIN deletion
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setPassword("");
              setShowPasswordInput(false);
            }}
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteUser}
            disabled={
              isDeleting || (currentUserRole === "HRM" && !password.trim())
            }
            className={`
              ${
                currentUserRole === "ADMIN"
                  ? "bg-red-700 hover:bg-red-800"
                  : "bg-red-600 hover:bg-red-700"
              }
              text-white
            `}
          >
            {isDeleting
              ? "Deleting..."
              : currentUserRole === "ADMIN"
              ? "Delete as ADMIN"
              : "Delete User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
