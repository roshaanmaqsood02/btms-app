import { authApi } from "./authApi";
import { userApi } from "./userApi";

// Combine all API reducers
export const combinedApiReducers = {
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: authApi.reducer,
};

// Combine all API middleware
export const combinedApiMiddlewares = [authApi.middleware, userApi.middleware];
