import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../services/userApi";

interface UserFilters {
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  isActive?: boolean;
}

interface UserState {
  page: number;
  limit: number;
  filters: UserFilters;
  selectedUser: User | null;
  error: string | null;
}

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

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // Pagination actions
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },

    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
      state.page = 1; // Reset to first page when changing limit
    },

    nextPage(state) {
      state.page += 1;
    },

    prevPage(state) {
      if (state.page > 1) {
        state.page -= 1;
      }
    },

    // Filter actions
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
      state.page = 1; // Reset to first page when searching
    },

    setSortBy(state, action: PayloadAction<string>) {
      state.filters.sortBy = action.payload;
    },

    setSortOrder(state, action: PayloadAction<"asc" | "desc">) {
      state.filters.sortOrder = action.payload;
    },

    toggleSortOrder(state) {
      state.filters.sortOrder =
        state.filters.sortOrder === "asc" ? "desc" : "asc";
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

    // Selected user actions
    setSelectedUser(state, action: PayloadAction<User | null>) {
      state.selectedUser = action.payload;
    },

    clearSelectedUser(state) {
      state.selectedUser = null;
    },

    // Error handling
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    clearError(state) {
      state.error = null;
    },

    // Reset entire state
    resetUsersState() {
      return initialState;
    },
  },
});

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

export default userSlice.reducer;

// Selectors
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

// Combined selector for query params
export const selectUserQueryParams = (state: { users: UserState }) => ({
  page: state.users.page,
  limit: state.users.limit,
  ...state.users.filters,
});
