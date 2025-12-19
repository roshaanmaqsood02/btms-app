import { api } from "@/redux/api";
import type {
  User,
  UsersResponse,
  GetUsersParams,
  UserByIdResponse,
  ErrorResponse,
} from "../../types/user.type";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get paginated list of users
    getUsers: builder.query<UsersResponse, GetUsersParams>({
      query: ({
        page = 1,
        limit = 10,
        search,
        sortBy,
        sortOrder,
        isActive,
      }) => {
        const params: Record<string, any> = { page, limit };

        if (search) params.search = search;
        if (sortBy) params.sortBy = sortBy;
        if (sortOrder) params.sortOrder = sortOrder;
        if (isActive !== undefined) params.isActive = isActive;

        return {
          url: "/users",
          method: "GET",
          params,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Users" as const, id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message:
          response.data?.message ||
          response.data?.error ||
          "Failed to fetch users",
      }),
    }),

    // Get single user by ID
    getUserById: builder.query<User, number | string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Users", id }],
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message:
          response.data?.message ||
          response.data?.error ||
          "Failed to fetch user",
      }),
    }),

    // Update user status (if you have an admin endpoint)
    updateUserStatus: builder.mutation<
      User,
      { id: number | string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message:
          response.data?.message ||
          response.data?.error ||
          "Failed to update user status",
      }),
    }),

    // Update user (HRM / OPERATION_MANAGER)
    updateUser: builder.mutation<
      User, // The User type from your backend
      { id: number | string; data: Partial<User> }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      // This is crucial for updating the cache
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
      // Add onQueryStarted to optimistically update the cache
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          userApi.util.updateQueryData("getUserById", id, (draft) => {
            Object.assign(draft, data);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message:
          response.data?.message ||
          response.data?.error ||
          "Failed to update user",
      }),
    }),

    // Delete user (if you have an admin endpoint)
    deleteUser: builder.mutation<{ message: string }, number | string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message:
          response.data?.message ||
          response.data?.error ||
          "Failed to delete user",
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useUpdateUserStatusMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
