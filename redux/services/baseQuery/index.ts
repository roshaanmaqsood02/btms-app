import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../../store";
import { logout } from "../../slices/authSlice";

// Get API URL from environment or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get the token from the state
    const token = (getState() as RootState).auth.accessToken;

    // If we have a token, add it to the headers
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Always set content-type for JSON
    headers.set("Content-Type", "application/json");

    return headers;
  },
  credentials: "include", // If you're using cookies
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized errors
  if (result.error && result.error.status === 401) {
    // You could implement token refresh logic here
    // For now, just logout the user
    api.dispatch(logout());

    // Optional: Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return result;
};

export default baseQueryWithReauth;
