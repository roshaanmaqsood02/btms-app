"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera, X, Check } from "lucide-react";
import { useAppSelector } from "@/redux/hook";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { useUpdateProfilePictureMutation } from "@/redux/services/authApi";
import { toast } from "sonner";

interface ProfilePictureUploaderProps {
  userId: string;
  onUploadSuccess?: (profilePicUrl: string) => void;
  size?: "sm" | "md" | "lg";
  canEdit?: boolean;
  profileData?: any;
}

export function ProfilePictureUploader({
  userId,
  onUploadSuccess,
  size = "lg",
  canEdit = false,
  profileData,
}: ProfilePictureUploaderProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Use authApi mutation instead of userApi
  const [updateProfilePicture, { isLoading: isUploading }] =
    useUpdateProfilePictureMutation();

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  // Determine if user can edit this picture
  const canEditPicture = () => {
    if (!currentUser) return false;

    // 1. User is editing their own profile (EVERYONE can do this)
    if (currentUser.id?.toString() === userId) return true;

    // 2. User is HRM/OM/PM editing someone else's profile
    if (canEdit) {
      return (
        currentUser.systemRole === "HRM" ||
        currentUser.systemRole === "OPERATION_MANAGER" ||
        currentUser.systemRole === "PROJECT_MANAGER" ||
        currentUser.systemRole === "ADMIN"
      );
    }

    return false;
  };

  const getInitials = (name?: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "U";

  const getProfilePicUrl = (profilePic?: string) => {
    if (!profilePic) return "";

    if (previewUrl) return previewUrl;

    if (profilePic.startsWith("http")) {
      return `${profilePic}?v=${Date.now()}`;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return `${baseUrl}/${profilePic.replace(/^\/+/, "")}?v=${Date.now()}`;
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please select a valid image file (JPEG, PNG, GIF, WebP)",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Image size must be less than 5MB",
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    try {
      const formData = new FormData();
      formData.append("profilePic", selectedFile);

      // If admin is updating someone else's picture, add userId
      const isSelfUpdate = currentUser?.id?.toString() === userId;
      if (!isSelfUpdate && canEdit) {
        formData.append("userId", userId);
      }

      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const result = await updateProfilePicture(formData).unwrap();

      console.log("Upload successful:", result);

      // Show appropriate success message
      toast.success("Profile picture updated successfully", {
        description: isSelfUpdate
          ? "Your profile picture has been updated"
          : `Picture for ${profileData?.name} has been updated`,
      });

      // Clear preview and file
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Call success callback with new profile picture URL
      if (onUploadSuccess && result.user?.profilePic) {
        onUploadSuccess(result.user.profilePic);
      }
    } catch (error: any) {
      console.error("Upload error:", error);

      // Extract error message
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to upload profile picture";

      toast.error("Upload failed", {
        description: errorMessage,
      });
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Check if this is self-update
  const isSelfUpdate = currentUser?.id?.toString() === userId;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar
          className={`${sizeClasses[size]} border-4 border-white shadow-lg`}
        >
          <AvatarImage
            src={getProfilePicUrl(profileData?.profilePic)}
            alt={profileData?.name || "Profile"}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-r from-[rgb(96,57,187)] to-[rgb(120,80,200)] text-white text-lg font-semibold">
            {getInitials(profileData?.name)}
          </AvatarFallback>
        </Avatar>

        {/* Show upload button if user has permission */}
        {canEditPicture() && (
          <div className="absolute bottom-0 right-0">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-full w-10 h-10 shadow-md hover:bg-gray-200 transition-colors bg-white"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title={
                isSelfUpdate
                  ? "Change your profile picture"
                  : "Change user's profile picture"
              }
            >
              <Camera className="h-5 w-5" />
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload preview and controls */}
      {previewUrl && canEditPicture() && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 w-full max-w-xs">
          <div className="flex items-center space-x-4 mb-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={previewUrl} alt="Preview" />
              <AvatarFallback>Preview</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                {selectedFile?.name}
              </p>
              <p className="text-xs text-gray-500">
                {Math.round((selectedFile?.size || 0) / 1024)} KB
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isSelfUpdate
                  ? "Updating your picture"
                  : "Updating user's picture"}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-[#6039BB] hover:bg-[#4a2c9c]"
              size="sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {isSelfUpdate ? "Update My Picture" : "Update Picture"}
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              size="sm"
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
