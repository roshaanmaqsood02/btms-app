import authReducer from "./authSlice";

// Combine all reducers
const combinedSlicesReducers = {
  auth: authReducer,
};

export default combinedSlicesReducers;
