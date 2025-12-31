import authReducer from "./authSlice";
import userReducer from "./userSlice";
import contractReducer from "./contractSlice";
import educationReducer from "./educationSlice";
import assetReducer from "./assetSlice";

// Combine all reducers
const combinedSlicesReducers = {
  auth: authReducer,
  user: userReducer,
  contract: contractReducer,
  education: educationReducer,
  asset: assetReducer,
};

export default combinedSlicesReducers;
