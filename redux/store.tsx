// redux/store.tsx
import { configureStore } from "@reduxjs/toolkit";
import loadingReducer from "./slices/loadingSlice"; // ← Import du nouveau slice
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    loading: loadingReducer, // ← Ajouté
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
