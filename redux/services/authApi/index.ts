import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../baseQuery";
import type {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  DeleteAccountRequest,
  ApiError,
} from "../../types/auth.type";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Auth"],
  endpoints: (builder) => ({
    // Register new user
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User", "Auth"],
    }),

    // Login user
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User", "Auth"],
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
    deleteAccount: builder.mutation<{ message: string }, DeleteAccountRequest>({
      query: (data) => ({
        url: "/auth/profile",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["User", "Auth"],
    }),

    // Check if user is authenticated
    checkAuth: builder.query<User, void>({
      query: () => "/auth/profile",
      providesTags: ["Auth"],
    }),

    // Logout (client-side only)
    logout: builder.mutation<void, void>({
      queryFn: () => ({ data: undefined }),
      invalidatesTags: ["User", "Auth"],
    }),
  }),
});

// Export hooks
export const {
  useRegisterMutation,
  useLoginMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
  useCheckAuthQuery,
  useLazyCheckAuthQuery,
  useLogoutMutation,
} = authApi;
