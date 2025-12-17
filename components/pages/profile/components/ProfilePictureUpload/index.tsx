// components/ProfilePictureUploader.tsx
"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera, X, Check } from "lucide-react";
import { useProfilePicture } from "@/hooks/useProfilePicture";
import { useAppSelector } from "@/redux/hook";
import { selectCurrentUser } from "@/redux/slices/authSlice";

interface ProfilePictureUploaderProps {
  onUploadSuccess?: (profilePicUrl: string) => void;
  size?: "sm" | "md" | "lg";
}

export function ProfilePictureUploader({
  onUploadSuccess,
  size = "lg",
}: ProfilePictureUploaderProps) {
  const user = useAppSelector(selectCurrentUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadProfilePicture, isLoading, error, clearError } =
    useProfilePicture();

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
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
    clearError();
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadProfilePicture(selectedFile);

    if (result.success) {
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onUploadSuccess && result.data?.profilePic) {
        onUploadSuccess(result.data.profilePic);
      }
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    clearError();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar
          className={`${sizeClasses[size]} border-4 border-white shadow-lg`}
        >
          <AvatarImage
            src={getProfilePicUrl(user?.profilePic)}
            alt={user?.name || "Profile"}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-r from-[rgb(96,57,187)] to-[rgb(120,80,200)] text-white text-lg font-semibold">
            {getInitials(user?.name)}
          </AvatarFallback>
        </Avatar>

        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute bottom-0 right-0 rounded-full w-10 h-10 shadow-md"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Camera className="h-5 w-5" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {previewUrl && (
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
                {(selectedFile?.size || 0) / 1024} KB
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isLoading}
              className="flex-1 bg-[#6039BB]"
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>Save</>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              className="text-gray-700"
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg max-w-xs">
          {typeof error === "string" ? error : "Failed to upload image"}
        </div>
      )}
    </div>
  );
}
