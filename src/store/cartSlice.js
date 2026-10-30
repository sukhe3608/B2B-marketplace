/* ============================================================
   TradeLink — cartSlice.js
   Redux Toolkit slice for shopping cart state.
   ============================================================ */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lines:         [],  // [{productId, qty, savedUnitPrice, flag, addedAt}]
  savedForLater: [],  // same shape — moved here when user saves a line
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addLine(state, { payload }) {
      // payload: { productId, qty, savedUnitPrice }
      const existing = state.lines.find((l) => l.productId === payload.productId);
      if (existing) {
        existing.qty           = payload.qty;
        existing.savedUnitPrice = payload.savedUnitPrice ?? existing.savedUnitPrice;
      } else {
        state.lines.push({
          productId:      payload.productId,
          qty:            payload.qty,
          savedUnitPrice: payload.savedUnitPrice ?? null,
          flag:           null,
          addedAt:        new Date().toISOString(),
        });
      }
    },

    updateQty(state, { payload }) {
      // payload: { productId, qty }
      const line = state.lines.find((l) => l.productId === payload.productId);
      if (line) {
        line.qty  = payload.qty;
        line.flag = null; // clear qty-exceeded flag on manual update
      }
    },

    removeLine(state, { payload }) {
      // payload: productId
      state.lines = state.lines.filter((l) => l.productId !== payload);
    },

    saveForLater(state, { payload }) {
      // payload: productId
      const idx = state.lines.findIndex((l) => l.productId === payload);
      if (idx !== -1) {
        const [line] = state.lines.splice(idx, 1);
        state.savedForLater.push(line);
      }
    },

    restoreFromSaved(state, { payload }) {
      // payload: productId
      const idx = state.savedForLater.findIndex((l) => l.productId === payload);
      if (idx !== -1) {
        const [line] = state.savedForLater.splice(idx, 1);
        state.lines.push({ ...line, flag: null });
      }
    },

    removeFromSaved(state, { payload }) {
      state.savedForLater = state.savedForLater.filter((l) => l.productId !== payload);
    },

    setFlag(state, { payload }) {
      // payload: { productId, flag }
      const line = state.lines.find((l) => l.productId === payload.productId);
      if (line) line.flag = payload.flag;
    },

    setLines(state, { payload }) {
      // Replace entire lines array (used after revalidation)
      state.lines = payload;
    },

    clearCart(state) {
      state.lines         = [];
      state.savedForLater = [];
    },

    acknowledgeFlag(state, { payload }) {
      // payload: productId — clears flag after user acknowledges price change
      const line = state.lines.find((l) => l.productId === payload);
      if (line) {
        if (line.overridePrice) line.savedUnitPrice = line.overridePrice;
        line.flag = null;
      }
    },
  },
});

export const {
  addLine, updateQty, removeLine,
  saveForLater, restoreFromSaved, removeFromSaved,
  setFlag, setLines, clearCart, acknowledgeFlag,
} = cartSlice.actions;

export default cartSlice.reducer;

/* ── Selectors ─────────────────────────────────────────────── */
export const selectCartLines       = (s) => s.cart.lines;
export const selectSavedForLater   = (s) => s.cart.savedForLater;
export const selectCartHasFlags    = (s) => s.cart.lines.some((l) => l.flag);
export const selectCartItemCount   = (s) => s.cart.lines.reduce((n, l) => n + l.qty, 0);

