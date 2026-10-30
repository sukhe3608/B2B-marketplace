/* ============================================================
   TradeLink — Redux Store
   Configures RTK store for cart, wishlist, and UI state.
   Persisted to localStorage key tl_redux.
   ============================================================ */
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import cartReducer      from './cartSlice';
import wishlistReducer  from './wishlistSlice';
import uiReducer        from './uiSlice';

const PERSIST_KEY = 'tl_redux';

/* ── Simple persistence middleware ─────────────────────────── */
function loadState() {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch { return undefined; }
}

function saveState(state) {
  try {
    localStorage.setItem(PERSIST_KEY, JSON.stringify({
      cart:     state.cart,
      wishlist: state.wishlist,
      // ui state is NOT persisted
    }));
  } catch { /* silent */ }
}

const preloadedState = loadState();

const rootReducer = combineReducers({
  cart:     cartReducer,
  wishlist: wishlistReducer,
  ui:       uiReducer,
});

export const store = configureStore({
  reducer:        rootReducer,
  preloadedState,
});

store.subscribe(() => saveState(store.getState()));

export default store;

