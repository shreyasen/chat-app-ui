import { configureStore } from "@reduxjs/toolkit";
import userActionReducer from "../reducers/userActionSlice";

export const store = configureStore({
  reducer: {
    userAction: userActionReducer,
  },
});
