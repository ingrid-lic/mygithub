import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      const item = state.find(i => i.id === action.payload.id);
      if (item) {
        item.count += 1;
      } else {
        state.push({ ...action.payload, count: 1 });
      }
    },
    removeFromCart: (state, action) => {
      return state.filter(i => i.id !== action.payload);
    },
    updateCount: (state, action) => {
      const item = state.find(i => i.id === action.payload.id);
      if (item) item.count = action.payload.count;
    },
  },
});

export const { addToCart, removeFromCart, updateCount } = cartSlice.actions;
export default cartSlice.reducer;
