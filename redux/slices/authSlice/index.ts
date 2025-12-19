import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../../services/authApi";
import { User } from "@/redux/types/auth.type";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// SSR-safe localStorage helpers
const getStoredToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

const getStoredUser = (): User | null => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      localStorage.removeItem("user");
      return null;
    }
  }
  return null;
};

const clearStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
};

const setStorage = (accessToken: string, user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    ...initialState,
    accessToken: getStoredToken(),
    user: getStoredUser(),
    isAuthenticated: !!getStoredToken() && !!getStoredUser(),
  },
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
      state.isInitialized = true;

      setStorage(action.payload.accessToken, action.payload.user);
    },

    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (typeof window !== "undefined" && state.user) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;

      clearStorage();
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    initializeAuth: (state) => {
      const token = getStoredToken();
      const user = getStoredUser();

      if (token && user) {
        state.accessToken = token;
        state.user = user;
        state.isAuthenticated = true;
      } else {
        state.accessToken = null;
        state.user = null;
        state.isAuthenticated = false;
      }
      state.isInitialized = true;
    },

    resetAuth: () => {
      clearStorage();
      return { ...initialState, isInitialized: true };
    },

    // Add new action for profile picture update
    updateUserProfilePicture: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.profilePic = action.payload;
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Handle successful login
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
        state.isInitialized = true;

        setStorage(action.payload.accessToken, action.payload.user);
      }
    );

    // Handle successful registration
    builder.addMatcher(
      authApi.endpoints.register.matchFulfilled,
      (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
        state.isInitialized = true;

        setStorage(action.payload.accessToken, action.payload.user);
      }
    );

    // Handle successful profile fetch
    builder.addMatcher(
      authApi.endpoints.getProfile.matchFulfilled,
      (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;

        if (typeof window !== "undefined" && state.user) {
          localStorage.setItem("user", JSON.stringify(action.payload));
        }
      }
    );

    // Handle successful profile update
    builder.addMatcher(
      authApi.endpoints.updateProfile.matchFulfilled,
      (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;

        if (typeof window !== "undefined" && state.user) {
          localStorage.setItem("user", JSON.stringify(action.payload));
        }
      }
    );

    // Handle successful profile picture update
    builder.addMatcher(
      authApi.endpoints.updateProfilePicture.matchFulfilled,
      (state, action) => {
        state.user = action.payload.user;
        state.isLoading = false;

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      }
    );

    // Handle successful account deletion
    builder.addMatcher(
      authApi.endpoints.deleteAccount.matchFulfilled,
      (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;

        clearStorage();
      }
    );

    // Handle logout
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      clearStorage();
    });

    // Handle loading states for auth endpoints
    builder.addMatcher(authApi.endpoints.login.matchPending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addMatcher(authApi.endpoints.register.matchPending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addMatcher(
      authApi.endpoints.updateProfile.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );

    builder.addMatcher(
      authApi.endpoints.updateProfilePicture.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );

    // Handle error states for auth endpoints
    builder.addMatcher(
      authApi.endpoints.login.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || action.error?.message || "Login failed";
      }
    );

    builder.addMatcher(
      authApi.endpoints.register.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Registration failed";
      }
    );

    builder.addMatcher(
      authApi.endpoints.updateProfile.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to update profile";
      }
    );

    builder.addMatcher(
      authApi.endpoints.updateProfilePicture.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to update profile picture";
      }
    );

    builder.addMatcher(
      authApi.endpoints.deleteAccount.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to delete account";
      }
    );

    // Handle unauthorized errors (401) - clear auth state
    builder.addMatcher(
      (action) => {
        return (
          action.type.includes("rejected") && action.payload?.status === 401
        );
      },
      (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        clearStorage();
      }
    );
  },
});

export const {
  setCredentials,
  setUser,
  logout,
  setLoading,
  setError,
  clearError,
  initializeAuth,
  resetAuth,
  updateUserProfilePicture, // Export the new action
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectAccessToken = (state: { auth: AuthState }) =>
  state.auth.accessToken;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsInitialized = (state: { auth: AuthState }) =>
  state.auth.isInitialized;
export const selectUserRole = (state: { auth: AuthState }) =>
  state.auth.user?.systemRole ?? null;
