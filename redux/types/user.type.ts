import { SystemRole } from "@/types";

// User management related types
export interface User {
  id: number;
  uuid: string;
  employeeId: string;
  attendanceId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  gender?: string;
  dateOfBirth: string;
  maritalStatus: string;
  bloodGroup: string;
  cnic: string;
  postalCode?: string;
  department?: string;
  projects?: string[];
  positions?: string[];
  profilePic?: string;
  systemRole: SystemRole;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
}

export interface UserByIdResponse {
  data: User;
}

// Common response interfaces
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
