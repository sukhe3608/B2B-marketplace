/* ============================================================
   TradeLink — wishlistSlice.js
   Redux Toolkit slice for wishlist and back-in-stock alerts.
   ============================================================ */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // [{ productId, addedAt, alertEnabled }]
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addItem(state, { payload }) {
      // payload: { productId }
      if (!state.items.find((i) => i.productId === payload.productId)) {
        state.items.push({
          productId:    payload.productId,
          addedAt:      new Date().toISOString(),
          alertEnabled: false,
        });
      }
    },

    removeItem(state, { payload }) {
      // payload: productId
      state.items = state.items.filter((i) => i.productId !== payload);
    },

    toggleAlert(state, { payload }) {
      // payload: productId
      const item = state.items.find((i) => i.productId === payload);
      if (item) item.alertEnabled = !item.alertEnabled;
    },

    clearWishlist(state) {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, toggleAlert, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

/* ── Selectors ─────────────────────────────────────────────── */
export const selectWishlistItems     = (s) => s.wishlist.items;
export const selectIsWishlisted      = (productId) => (s) => s.wishlist.items.some((i) => i.productId === productId);
export const selectWishlistCount     = (s) => s.wishlist.items.length;
export const selectAlertEnabled      = (productId) => (s) => {
  const item = s.wishlist.items.find((i) => i.productId === productId);
  return item?.alertEnabled ?? false;
};

