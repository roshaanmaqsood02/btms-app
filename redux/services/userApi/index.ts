import { api } from "@/redux/api";
import type {
  User,
  UsersResponse,
  GetUsersParams,
} from "@/redux/types/user.type";
import { selectUserQueryParams } from "@/redux/slices/userSlice";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /* --------------------------- GET USERS (Paginated) -------------------------- */
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

    /* --------------------------- GET USER BY ID --------------------------- */
    getUserById: builder.query<User, number | string>({
      query: (id) => ({ url: `/users/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Users", id }],
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message:
          response.data?.message ||
          response.data?.error ||
          "Failed to fetch user",
      }),
    }),

    /* --------------------------- UPDATE USER STATUS ------------------------ */
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

    /* --------------------------- UPDATE USER ------------------------ */
    updateUser: builder.mutation<
      User,
      { id: number | string; data: Partial<User> }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
      async onQueryStarted(
        { id, data },
        { dispatch, getState, queryFulfilled }
      ) {
        const state = getState() as any;
        const queryParams: GetUsersParams = selectUserQueryParams(state);

        // Optimistic update getUserById
        const getUserByIdPatch = dispatch(
          userApi.util.updateQueryData("getUserById", id, (draft) => {
            if (draft) Object.assign(draft, data);
          })
        );

        // Optimistic update getUsers
        const getUsersPatch = dispatch(
          userApi.util.updateQueryData("getUsers", queryParams, (draft) => {
            if (draft?.data) {
              const index = draft.data.findIndex((u) => u.id === id);
              if (index !== -1)
                draft.data[index] = { ...draft.data[index], ...data };
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          getUserByIdPatch.undo();
          getUsersPatch.undo();
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

    /* --------------------------- DELETE USER ------------------------ */
    deleteUser: builder.mutation<{ message: string }, number | string>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const state = getState() as any;
        const queryParams: GetUsersParams = selectUserQueryParams(state);

        const patchResult = dispatch(
          userApi.util.updateQueryData("getUsers", queryParams, (draft) => {
            if (draft?.data) {
              draft.data = draft.data.filter((u) => u.id !== id);
              draft.total = draft.total - 1;
            }
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
