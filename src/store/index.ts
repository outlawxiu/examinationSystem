import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user";
import settingReducer from "./setting";
// import examReducer from "./exam";
const store = configureStore({
  reducer: {
    user: userReducer,
    setting: settingReducer,
    // exam: examReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
