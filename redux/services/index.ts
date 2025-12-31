import { authApi } from "./authApi";
import { contractApi } from "./contractApi";
import { userApi } from "./userApi";
import { educationApi } from "./educationApi";
import { assetApi } from "./assetApi";

// Combine all API reducers
export const combinedApiReducers = {
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [contractApi.reducerPath]: contractApi.reducer,
  [educationApi.reducerPath]: educationApi.reducer,
  [assetApi.reducerPath]: assetApi.reducer,
};

// Combine all API middleware
export const combinedApiMiddlewares = [
  authApi.middleware,
  userApi.middleware,
  contractApi.middleware,
  educationApi.middleware,
  assetApi.middleware,
];
