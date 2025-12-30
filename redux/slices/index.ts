import authReducer from "./authSlice";
import userReducer from "./userSlice";
import contractReducer from "./contractSlice";
import educationReducer from "./educationSlice";

// Combine all reducers
const combinedSlicesReducers = {
  auth: authReducer,
  user: userReducer,
  contract: contractReducer,
  education: educationReducer,
};

export default combinedSlicesReducers;
