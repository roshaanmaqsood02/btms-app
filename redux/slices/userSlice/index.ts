import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, GetUsersParams } from "@/redux/types/user.type";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type SortOrder = "asc" | "desc";
export type UserSortField = "createdAt" | "name" | "email";

export interface UserFilters {
  search: string;
  sortBy: UserSortField;
  sortOrder: SortOrder;
  isActive?: boolean;
}

export interface UserState {
  page: number;
  limit: number;
  filters: UserFilters;
  selectedUser: User | null;
  error: string | null;
}

/* -------------------------------------------------------------------------- */
/*                                INITIAL STATE                               */
/* -------------------------------------------------------------------------- */

const initialState: UserState = {
  page: 1,
  limit: 10,
  filters: {
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    isActive: undefined,
  },
  selectedUser: null,
  error: null,
};

/* -------------------------------------------------------------------------- */
/*                                   SLICE                                    */
/* -------------------------------------------------------------------------- */

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    /* ------------------------------- Pagination ------------------------------ */

    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },

    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
      state.page = 1;
    },

    nextPage(state) {
      state.page += 1;
    },

    prevPage(state) {
      if (state.page > 1) state.page -= 1;
    },

    /* --------------------------------- Filters -------------------------------- */

    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
      state.page = 1;
    },

    setSortBy(state, action: PayloadAction<UserSortField>) {
      state.filters.sortBy = action.payload;
      state.page = 1;
    },

    setSortOrder(state, action: PayloadAction<SortOrder>) {
      state.filters.sortOrder = action.payload;
      state.page = 1;
    },

    toggleSortOrder(state) {
      state.filters.sortOrder =
        state.filters.sortOrder === "asc" ? "desc" : "asc";
      state.page = 1;
    },

    setIsActiveFilter(state, action: PayloadAction<boolean | undefined>) {
      state.filters.isActive = action.payload;
      state.page = 1;
    },

    setFilters(state, action: PayloadAction<Partial<UserFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },

    clearFilters(state) {
      state.filters = initialState.filters;
      state.page = 1;
    },

    /* ------------------------------ Selected User ----------------------------- */

    setSelectedUser(state, action: PayloadAction<User | null>) {
      state.selectedUser = action.payload;
    },

    clearSelectedUser(state) {
      state.selectedUser = null;
    },

    /* ---------------------------------- Errors -------------------------------- */

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    clearError(state) {
      state.error = null;
    },

    /* ---------------------------------- Reset --------------------------------- */

    resetUsersState() {
      return initialState;
    },
  },
});

/* -------------------------------------------------------------------------- */
/*                                   EXPORTS                                  */
/* -------------------------------------------------------------------------- */

export default userSlice.reducer;

export const {
  setPage,
  setLimit,
  nextPage,
  prevPage,
  setSearch,
  setSortBy,
  setSortOrder,
  toggleSortOrder,
  setIsActiveFilter,
  setFilters,
  clearFilters,
  setSelectedUser,
  clearSelectedUser,
  setError,
  clearError,
  resetUsersState,
} = userSlice.actions;

/* -------------------------------------------------------------------------- */
/*                                  SELECTORS                                 */
/* -------------------------------------------------------------------------- */

export const selectUserPage = (state: { users: UserState }) => state.users.page;

export const selectUserLimit = (state: { users: UserState }) =>
  state.users.limit;

export const selectUserFilters = (state: { users: UserState }) =>
  state.users.filters;

export const selectUserSearch = (state: { users: UserState }) =>
  state.users.filters.search;

export const selectSelectedUser = (state: { users: UserState }) =>
  state.users.selectedUser;

export const selectUserError = (state: { users: UserState }) =>
  state.users.error;

/* --------------------- Combined selector (RTK Query) ---------------------- */

export const selectUserQueryParams = createSelector(
  (state: { users: UserState }) => state.users.page,
  (state: { users: UserState }) => state.users.limit,
  (state: { users: UserState }) => state.users.filters,
  (page, limit, filters) => ({
    page,
    limit,
    ...filters,
  })
);
