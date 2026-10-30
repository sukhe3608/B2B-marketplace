/* ============================================================
   TradeLink — Verification Store
   Manages seller verification requests in localStorage.
   Acts as the shared data bus between B2B app and Admin Portal.
   ============================================================ */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const REJECTION_ITEMS = [
  // Document issues
  { id: 'gst_blurry',        label: 'GST certificate is blurry / unreadable',      doc: 'gst' },
  { id: 'gst_mismatch',      label: 'GST number doesn\'t match certificate',        doc: 'gst' },
  { id: 'pan_invalid',       label: 'PAN card is expired or invalid',               doc: 'pan' },
  { id: 'pan_mismatch',      label: 'PAN number doesn\'t match submitted details',  doc: 'pan' },
  { id: 'kyc_incomplete',    label: 'KYC document is incomplete',                   doc: 'kyc' },
  { id: 'kyc_expired',       label: 'KYC document is expired',                      doc: 'kyc' },
  // Information issues
  { id: 'name_mismatch',     label: 'Business name mismatch across documents',      doc: null  },
  { id: 'address_mismatch',  label: 'Address on documents doesn\'t match profile',  doc: null  },
  { id: 'duplicate_reg',     label: 'Suspicious or duplicate registration',          doc: null  },
];

export { REJECTION_ITEMS };

/**
 * Creates a blank verification request object.
 */
export function createVerificationRequest(seller) {
  return {
    id: 'vreq_' + Date.now(),
    sellerId: seller.id,
    sellerName: seller.name || '',
    companyName: seller.companyName || seller.name || '',
    email: seller.email || '',
    phone: seller.phone || '',
    gstNumber: '',
    panNumber: '',
    documents: {
      gst: null,   // base64 data URL
      pan: null,
      kyc: null,
    },
    status: 'pending',          // pending | under_review | verified | rejected | re_submitted
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewerName: null,
    reviewerNotes: null,        // internal — NOT shown to seller
    rejectedItems: [],          // array of REJECTION_ITEMS ids flagged by admin
    rejectionNote: null,        // human-readable note shown to seller
    resubmissionHistory: [],    // [{ submittedAt, documents }]
  };
}

const useVerificationStore = create(
  persist(
    (set, get) => ({
      /* ── State ────────────────────────────────────────────── */
      requests: [],   // all verification requests

      /* ── Seller Actions ───────────────────────────────────── */

      /**
       * Submit a new verification request (or re-submission).
       * Returns the new/updated request object.
       */
      submitRequest: (seller, formData) => {
        const existing = get().requests.find((r) => r.sellerId === seller.id);

        if (existing && existing.status === 'rejected') {
          // Re-submission: push history, update docs, reset status
          const updated = {
            ...existing,
            ...formData,
            status: 're_submitted',
            submittedAt: new Date().toISOString(),
            reviewedAt: null,
            reviewerNotes: null,
            resubmissionHistory: [
              ...existing.resubmissionHistory,
              {
                submittedAt: existing.submittedAt,
                documents: existing.documents,
                rejectedItems: existing.rejectedItems,
                rejectionNote: existing.rejectionNote,
              },
            ],
            // Keep rejectedItems until admin clears them
          };
          set((state) => ({
            requests: state.requests.map((r) =>
              r.sellerId === seller.id ? updated : r
            ),
          }));
          return updated;
        }

        // First submission
        const request = {
          ...createVerificationRequest(seller),
          ...formData,
        };
        set((state) => ({ requests: [...state.requests, request] }));
        return request;
      },

      /**
       * Get the active request for a seller.
       */
      getRequestBySellerId: (sellerId) => {
        return get().requests.find((r) => r.sellerId === sellerId) || null;
      },

      /* ── Admin Actions ────────────────────────────────────── */

      /**
       * Admin: approve a request by id.
       */
      approveRequest: (id, reviewerName, notes = '') => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'verified',
                  reviewedAt: new Date().toISOString(),
                  reviewerName,
                  reviewerNotes: notes,
                  rejectedItems: [],
                  rejectionNote: null,
                }
              : r
          ),
        }));
      },

      /**
       * Admin: reject a request by id with a checklist + optional note.
       */
      rejectRequest: (id, reviewerName, rejectedItems = [], rejectionNote = '', internalNotes = '') => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'rejected',
                  reviewedAt: new Date().toISOString(),
                  reviewerName,
                  reviewerNotes: internalNotes,
                  rejectedItems,
                  rejectionNote,
                }
              : r
          ),
        }));
      },

      /**
       * Admin: mark a request as under_review (when reviewer opens it).
       */
      markUnderReview: (id, reviewerName) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id && r.status === 'pending'
              ? { ...r, status: 'under_review', reviewerName }
              : r
          ),
        }));
      },

      /**
       * Get all requests (for admin list view).
       */
      getAllRequests: () => get().requests,

      /**
       * Get a single request by id.
       */
      getRequestById: (id) => get().requests.find((r) => r.id === id) || null,
    }),
    {
      name: 'tradelink-verification-requests',  // shared localStorage key
      partialize: (state) => ({ requests: state.requests }),
    }
  )
);

export default useVerificationStore;
