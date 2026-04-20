// redux/slices/loadingSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: {
    isLoading: false,
  },
  reducers: {
    setLoadingTrue: (state) => {
      state.isLoading = true;
    },
    setLoadingFalse: (state) => {
      state.isLoading = false;
    },
  },
});

export const { setLoadingTrue, setLoadingFalse } = loadingSlice.actions;
export default loadingSlice.reducer;