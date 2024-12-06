import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  apiExaminationCreate,
  apiExaminationList,
  apiExaminationUpdate,
  apiExaminationRemove,
  apiExaminationDetail,
} from "../services/index";

export const getExaminationCreate = createAsyncThunk(
  "getExaminationCreate",
  async (params) => {
    const res = await apiExaminationCreate(params);
    return res.data;
  }
);

const exam = createSlice({
  name: "exam",
  initialState: {},
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getExaminationCreate.fulfilled, (state, action) => {
      console.log(action.payload);
    });
  },
});



export const {} = exam.actions;
export default exam.reducer;
