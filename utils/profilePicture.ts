// utils/profilePicture.ts

/**
 * Creates FormData for profile picture upload
 */
export const createProfilePictureFormData = (file: File): FormData => {
  const formData = new FormData();
  formData.append("profilePic", file);
  return formData;
};

/**
 * Validates profile picture file
 */
export const validateProfilePicture = (
  file: File
): { isValid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Only JPG, PNG, and GIF images are allowed",
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "Image size must be less than 5MB",
    };
  }

  return { isValid: true };
};

/**
 * Gets file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

/**
 * Generates a unique filename for profile picture
 */
export const generateProfilePictureName = (
  userId: string | number,
  originalName: string
): string => {
  const timestamp = Date.now();
  const extension = getFileExtension(originalName);
  return `profile_${userId}_${timestamp}.${extension}`;
};
