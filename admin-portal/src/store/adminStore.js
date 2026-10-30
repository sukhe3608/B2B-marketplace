/* ================================================================
   Admin Portal — Shared Data Store
   Reads/writes the same localStorage key as the B2B app.
   Supports real-time cross-tab synchronization.
   ================================================================ */
import { create } from 'zustand';

export const STORE_KEY = 'tradelink-verification-requests';

/* Rejection item catalog (mirrors verificationStore.js) */
export const REJECTION_ITEMS = [
  { id: 'gst_blurry',       label: "GST certificate is blurry / unreadable",     doc: 'gst' },
  { id: 'gst_mismatch',     label: "GST number doesn't match certificate",        doc: 'gst' },
  { id: 'pan_invalid',      label: "PAN card is expired or invalid",              doc: 'pan' },
  { id: 'pan_mismatch',     label: "PAN number doesn't match submitted details",  doc: 'pan' },
  { id: 'kyc_incomplete',   label: "KYC document is incomplete",                  doc: 'kyc' },
  { id: 'kyc_expired',      label: "KYC document is expired",                     doc: 'kyc' },
  { id: 'name_mismatch',    label: "Business name mismatch across documents",     doc: null  },
  { id: 'address_mismatch', label: "Address on documents doesn't match profile",  doc: null  },
  { id: 'duplicate_reg',    label: "Suspicious or duplicate registration",         doc: null  },
];

const SAMPLE_REQUESTS = [
  {
    id: 'vreq_sample_1',
    sellerId: 'seller_101',
    sellerName: 'Vikram Sharma',
    companyName: 'Apex Textiles & Fab Private Limited',
    email: 'vikram@apextextiles.in',
    phone: '+91 98201 44521',
    gstNumber: '27AABCA1234F1Z5',
    panNumber: 'AABCA1234F',
    documents: {
      gst: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="16" fill="%23334155">GSTIN: 27AABCA1234F1Z5</text><text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="14" fill="%2364748b">Government of India - GST Reg Certificate</text></svg>',
      pan: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="16" fill="%231e293b">INCOME TAX DEPARTMENT - GOI</text><text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="14" fill="%23475569">PAN: AABCA1234F</text></svg>',
      kyc: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="16" fill="%231e293b">KYC - Aadhaar / Director ID</text><text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="14" fill="%23475569">Verified Identity Proof</text></svg>',
    },
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    reviewedAt: null,
    reviewerName: null,
    reviewerNotes: null,
    rejectedItems: [],
    rejectionNote: null,
    resubmissionHistory: [],
  },
  {
    id: 'vreq_sample_2',
    sellerId: 'seller_102',
    sellerName: 'Sunita Patel',
    companyName: 'Narmada Agro Commodities LLP',
    email: 'info@narmadaagro.com',
    phone: '+91 97234 11098',
    gstNumber: '24AAACN9876Q1Z2',
    panNumber: 'AAACN9876Q',
    documents: {
      gst: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16" fill="%23334155">GSTIN: 24AAACN9876Q1Z2</text></svg>',
      pan: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16" fill="%23334155">PAN: AAACN9876Q</text></svg>',
      kyc: null,
    },
    status: 'under_review',
    submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    reviewedAt: null,
    reviewerName: 'Admin Rahul',
    reviewerNotes: 'Checking GSTIN portal verification',
    rejectedItems: [],
    rejectionNote: null,
    resubmissionHistory: [],
  },
  {
    id: 'vreq_sample_3',
    sellerId: 'seller_103',
    sellerName: 'Arjun Mehta',
    companyName: 'Global Polymer Extrusions',
    email: 'arjun@globalpolymers.co',
    phone: '+91 98450 88219',
    gstNumber: '29ABCDE5432K1Z9',
    panNumber: 'ABCDE5432K',
    documents: {
      gst: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16" fill="%23334155">GSTIN: 29ABCDE5432K1Z9</text></svg>',
      pan: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16" fill="%23334155">PAN: ABCDE5432K</text></svg>',
      kyc: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16" fill="%23334155">KYC Verified</text></svg>',
    },
    status: 're_submitted',
    submittedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    reviewedAt: null,
    reviewerName: null,
    reviewerNotes: 'Resubmitted after GST blurry error',
    rejectedItems: ['gst_blurry'],
    rejectionNote: 'Previous GST was blurry. Seller has re-uploaded a clearer scan.',
    resubmissionHistory: [
      {
        submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        rejectedItems: ['gst_blurry'],
        rejectionNote: 'Please upload a clear PDF or 300 DPI scan of your GST Registration Certificate.'
      }
    ],
  },
  {
    id: 'vreq_sample_4',
    sellerId: 'seller_104',
    sellerName: 'Kavita Rao',
    companyName: 'Zenith Fasteners & Hardware',
    email: 'kavita@zenithfasteners.com',
    phone: '+91 99001 77342',
    gstNumber: '33AABCF9012J1Z8',
    panNumber: 'AABCF9012J',
    documents: {
      gst: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16" fill="%23334155">GSTIN Verified</text></svg>',
      pan: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16" fill="%23334155">PAN Verified</text></svg>',
      kyc: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16" fill="%23334155">KYC Verified</text></svg>',
    },
    status: 'verified',
    submittedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    reviewedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    reviewerName: 'Admin Rahul',
    reviewerNotes: 'All papers verified against MCA and GST portal',
    rejectedItems: [],
    rejectionNote: null,
    resubmissionHistory: [],
  }
];

function readRequests() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      // Seed initial sample data so admin portal is immediately rich
      writeRequests(SAMPLE_REQUESTS);
      return SAMPLE_REQUESTS;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed?.requests) ? parsed.requests : [];
    if (list.length === 0) {
      writeRequests(SAMPLE_REQUESTS);
      return SAMPLE_REQUESTS;
    }
    return list;
  } catch {
    return SAMPLE_REQUESTS;
  }
}

function writeRequests(requests) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ requests }));
  } catch {
    /* silent */
  }
}

const useAdminStore = create((set, get) => ({
  requests: readRequests(),
  currentAdmin: {
    name: 'Admin Rahul',
    role: 'Senior Compliance Reviewer',
    email: 'admin.rahul@tradelink.internal',
    avatar: 'AR'
  },

  /** Refresh from localStorage */
  refresh: () => {
    set({ requests: readRequests() });
  },

  /** Approve a request */
  approve: (id, reviewerName = 'Admin Rahul', internalNotes = '') => {
    const requests = readRequests().map((r) =>
      r.id === id
        ? {
            ...r,
            status: 'verified',
            reviewedAt: new Date().toISOString(),
            reviewerName,
            reviewerNotes: internalNotes,
            rejectedItems: [],
            rejectionNote: null
          }
        : r
    );
    writeRequests(requests);
    set({ requests });
  },

  /** Reject a request with itemised checklist and feedback for seller */
  reject: (id, reviewerName = 'Admin Rahul', rejectedItems = [], rejectionNote = '', internalNotes = '') => {
    const requests = readRequests().map((r) =>
      r.id === id
        ? {
            ...r,
            status: 'rejected',
            reviewedAt: new Date().toISOString(),
            reviewerName,
            reviewerNotes: internalNotes,
            rejectedItems,
            rejectionNote
          }
        : r
    );
    writeRequests(requests);
    set({ requests });
  },

  /** Mark as under_review when opened */
  markUnderReview: (id, reviewerName = 'Admin Rahul') => {
    const requests = readRequests().map((r) =>
      r.id === id && (r.status === 'pending' || r.status === 're_submitted')
        ? { ...r, status: 'under_review', reviewerName }
        : r
    );
    writeRequests(requests);
    set({ requests });
  },

  getById: (id) => get().requests.find((r) => r.id === id) || null,
}));

// Cross-tab real time sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORE_KEY) {
      useAdminStore.getState().refresh();
    }
  });
}

export default useAdminStore;
