export interface User {
  id: number;
  uuid?: string;
  email: string;
  attendanceId: string;
  name: string;
  gender: string;
  dateOfBirth: Date;
  maritalStatus: string;
  bloodGroup?: string;
  cnic?: string;
  profilePic?: string;
  city?: string;
  country?: string;
  phone?: string;
  postalCode?: string;
  department?: string;
  projects?: string[];
  positions?: string[];
  systemRole?:
    | "EMPLOYEE"
    | "PROJECT_MANAGER"
    | "OPERATION_MANAGER"
    | "HRM"
    | "ADMIN";
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  gender: string;
  profilePic?: string;
  city?: string;
  country?: string;
  phone?: string;
  postalCode?: string;
  department?: string;
  projects?: string[];
  positions?: string[];
}

export interface UpdateProfileRequest {
  currentPassword?: string;
  newPassword?: string;
  name?: string;
  gender?: string;
  profilePic?: string;
  city?: string;
  country?: string;
  phone?: string;
  postalCode?: string;
  department?: string;
  projects?: string[];
  positions?: string[];
}

export interface UpdateProfilePictureRequest {
  profilePic: File;
}

export interface ProfilePictureResponse {
  profilePic: string;
  message?: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface ApiError {
  status: number;
  data: {
    message?: string;
    error?: string;
  };
}

export interface ExtendedApiError extends ApiError {
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UploadStatus {
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  error?: string;
}
