import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  leftPanel: "DEFAULT",
};

const userActionSlice = createSlice({
  name: "userAction",
  initialState,
  reducers: {
    performAction: (state, action) => {
      state.leftPanel = action.payload;
    },
  },
});
export const { performAction } = userActionSlice.actions;
export default userActionSlice.reducer;
