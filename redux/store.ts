import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import contractReducer from "./slices/contractSlice";
import assetReducer from "./slices/assetSlice";
import educationReducer from "./slices/educationSlice";
import { authApi } from "./services/authApi";
import { userApi } from "./services/userApi";
import { contractApi } from "./services/contractApi";
import { educationApi } from "./services/educationApi";
import { assetApi } from "./services/assetApi";

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      users: userReducer,
      contract: contractReducer,
      asset: assetReducer,
      education: educationReducer,
      [authApi.reducerPath]: authApi.reducer,
      [userApi.reducerPath]: userApi.reducer,
      [contractApi.reducerPath]: contractApi.reducer,
      [educationApi.reducerPath]: educationApi.reducer,
      [assetApi.reducerPath]: assetApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        userApi.middleware,
        contractApi.middleware,
        educationApi.middleware,
        assetApi.middleware
      ),
    devTools: process.env.NODE_ENV !== "production",
  });

  setupListeners(store.dispatch);

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
