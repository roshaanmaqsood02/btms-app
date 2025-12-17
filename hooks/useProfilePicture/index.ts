import { useState } from "react";
import { useUpdateProfilePictureMutation } from "@/redux/services/authApi";
import {
  validateProfilePicture,
  createProfilePictureFormData,
} from "@/utils/profilePicture";
import { useAppDispatch } from "@/redux/hook";
import { updateUserProfilePicture } from "@/redux/slices/authSlice";
import type { User } from "@/redux/types/auth.type";

export const useProfilePicture = () => {
  const [updateProfilePicture, { isLoading, error: rtqError, isSuccess }] =
    useUpdateProfilePictureMutation();
  const dispatch = useAppDispatch();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadProfilePicture = async (file: File) => {
    setUploadError(null);

    // Validate file
    const validation = validateProfilePicture(file);
    if (!validation.isValid) {
      setUploadError(validation.error || "Invalid file");
      return { success: false, error: validation.error };
    }

    try {
      const formData = createProfilePictureFormData(file);

      // Call the API
      const response = await updateProfilePicture(formData).unwrap();

      /**
       * Backend returns:
       * {
       *   message: string,
       *   user: User
       * }
       */
      const user = (response as { message: string; user: User }).user;

      if (!user || !user.profilePic) {
        throw new Error("No profile picture returned from server");
      }

      // Update Redux state
      dispatch(updateUserProfilePicture(user.profilePic));

      return { success: true, data: user };
    } catch (err: any) {
      const errorMessage =
        err?.data?.message ||
        err?.error ||
        err?.message ||
        "Failed to upload profile picture";
      setUploadError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => setUploadError(null);

  return {
    uploadProfilePicture,
    isLoading,
    error: rtqError || uploadError,
    isSuccess,
    clearError,
  };
};
