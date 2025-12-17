import authReducer from "./authSlice";
import userReducer from "./userSlice";

// Combine all reducers
const combinedSlicesReducers = {
  auth: authReducer,
  user: userReducer,
};

export default combinedSlicesReducers;
