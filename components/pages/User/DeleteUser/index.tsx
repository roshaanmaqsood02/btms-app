// components/DeleteUserDialog.tsx
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
import { useCallback } from "react";
import { toast } from "sonner";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToDelete: { id: string; name: string } | null;
  onDeleteSuccess?: () => void;
  currentUserRole?: string;
}

export default function DeleteUserDialog({
  open,
  onOpenChange,
  userToDelete,
  onDeleteSuccess,
  currentUserRole,
}: DeleteUserDialogProps) {
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const handleDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    // Check if user has permission (only HRM can delete)
    if (currentUserRole !== "HRM") {
      toast.error("Permission denied", {
        description: "Only HRM can delete users",
      });
      return;
    }

    try {
      await deleteUser(userToDelete.id).unwrap();

      toast.success("User deleted successfully", {
        description: `User "${userToDelete.name}" has been removed from the system`,
      });

      onOpenChange(false);

      // Call the success callback if provided
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
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
  }, [
    userToDelete,
    deleteUser,
    currentUserRole,
    onOpenChange,
    onDeleteSuccess,
  ]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">
              {userToDelete?.name}
            </span>
            ? This action cannot be undone. All user data, including assignments
            and history, will be permanently removed from the system.
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
  );
}
