import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user";
import settingReducer from "./setting";
const store = configureStore({
  reducer: {
    user: userReducer,
    setting: settingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
