/* ============================================================
   TradeLink — uiSlice.js
   Redux Toolkit slice for toasts, modals, and UI flags.
   ============================================================ */
import { createSlice } from '@reduxjs/toolkit';

let _toastId = 0;

const initialState = {
  toasts:     [], // [{ id, message, type, title? }]
  activeModal: null, // string | null  e.g. 'adjustStock', 'confirm'
  modalProps:  null,
  notifications: 0, // back-in-stock badge count
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast(state, { payload }) {
      // payload: { message, type?, title?, duration? }
      _toastId += 1;
      state.toasts.push({
        id:       _toastId,
        message:  payload.message,
        type:     payload.type  ?? 'info',     // info | success | warning | error
        title:    payload.title ?? null,
        duration: payload.duration ?? 4000,
      });
    },

    dismissToast(state, { payload }) {
      // payload: id
      state.toasts = state.toasts.filter((t) => t.id !== payload);
    },

    clearToasts(state) {
      state.toasts = [];
    },

    openModal(state, { payload }) {
      // payload: { name, props? }
      state.activeModal = payload.name;
      state.modalProps  = payload.props ?? null;
    },

    closeModal(state) {
      state.activeModal = null;
      state.modalProps  = null;
    },

    incrementNotifications(state, { payload }) {
      state.notifications += (payload ?? 1);
    },

    clearNotifications(state) {
      state.notifications = 0;
    },
  },
});

export const {
  showToast, dismissToast, clearToasts,
  openModal, closeModal,
  incrementNotifications, clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;

/* ── Selectors ─────────────────────────────────────────────── */
export const selectToasts         = (s) => s.ui.toasts;
export const selectActiveModal    = (s) => s.ui.activeModal;
export const selectModalProps     = (s) => s.ui.modalProps;
export const selectNotifications  = (s) => s.ui.notifications;

