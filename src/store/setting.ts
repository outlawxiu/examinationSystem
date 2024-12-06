import { createSlice } from "@reduxjs/toolkit";

const setting = createSlice({
  name: "setting",
  initialState: {
    isLight: true,
    pathname:"/welcome"
  },
  reducers: {
    toggleTheme(state,action){
        state.isLight = action.payload
    }
  },
});

export const { toggleTheme } = setting.actions;

export default setting.reducer;
