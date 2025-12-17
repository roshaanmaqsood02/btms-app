// Authentication related types
export interface User {
  id: number;
  uuid?: string;
  email: string;
  name: string;
  gender: string;
  city?: string;
  country?: string;
  phone?: string;
  postalCode?: string;
  department?: string;
  projects?: string[];
  positions?: string[];
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
  city?: string;
  country?: string;
  phone?: string;
  postalCode?: string;
  department?: string;
  projects?: string[];
  positions?: string[];
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
