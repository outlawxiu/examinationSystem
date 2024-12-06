import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { userInfo } from "../type";
import { apiUserInfo, apiUserMenuList } from "../services/index";
export const getUser = createAsyncThunk("user/getUser", async () => {
  const res = await Promise.all([apiUserInfo(), apiUserMenuList()]);
  return { userInfo: res[0].data, menulist: res[1].data };
});

const userStore = createSlice({
  name: "userStore",
  initialState: {
    loading: false,
    userInfo: <userInfo | null>null,
    menulist: [],
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload.userInfo.data;
        state.menulist = action.payload.menulist.data.list;
      })
      .addCase(getUser.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {} = userStore.actions;

export default userStore.reducer;
