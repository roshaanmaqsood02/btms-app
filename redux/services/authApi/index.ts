import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../baseQuery";

// Types based on your API
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

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // Register new user
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    // Login user
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    // Get user profile
    getProfile: builder.query<User, void>({
      query: () => "/auth/profile",
      providesTags: ["User"],
    }),

    // Update user profile
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (data) => ({
        url: "/auth/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Delete user account
    deleteAccount: builder.mutation<void, DeleteAccountRequest>({
      query: (data) => ({
        url: "/auth/profile",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Check if user is authenticated
    checkAuth: builder.query<User, void>({
      query: () => "/auth/profile",
    }),
  }),
});

// Export hooks for usage in components
export const {
  useRegisterMutation,
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
  useCheckAuthQuery,
} = authApi;
