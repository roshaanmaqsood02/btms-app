"use client";

import { useState } from "react";
import { useDeleteAccountMutation } from "@/redux/services/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess?: () => void;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onDeleteSuccess,
}: DeleteAccountDialogProps) {
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [password, setPassword] = useState("");

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      alert("Please enter your password to confirm account deletion.");
      return;
    }

    try {
      await deleteAccount({ password }).unwrap();
      setPassword("");
      onOpenChange(false);

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }

      alert("Account deleted successfully");
    } catch (error: any) {
      console.error("Delete failed:", error);
      alert(error?.data?.message || "Failed to delete account");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription className="text-red-600">
            This action cannot be undone. This will permanently delete your
            account and remove all your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              ⚠️ <strong>Warning:</strong> Once you delete your account, there
              is no going back. Please be certain.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delete-password" className="text-sm font-medium">
              Enter your password to confirm:
            </Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="rounded-xl py-6"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setPassword("");
            }}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            disabled={isDeleting || !password.trim()}
            variant="destructive"
            className="rounded-xl px-8"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
