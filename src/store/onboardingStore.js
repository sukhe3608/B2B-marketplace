/* ============================================================
   TradeLink — Zustand Onboarding Store
   Tracks multi-step seller KYC form data with auto-save.
   ============================================================ */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useOnboardingStore = create(
  persist(
    (set, get) => ({
      /* ── Seller KYC Form State ────────────────────────────── */
      currentStep: 0, // 0=Business Info, 1=Legal/KYC, 2=Category, 3=Documents
      totalSteps: 4,

      businessInfo: {
        companyName: '',
        businessType: '',
        yearEstablished: '',
        numberOfEmployees: '',
      },

      legalInfo: {
        gstNumber: '',
        panNumber: '',
        businessAddress: '',
        state: '',
        city: '',
        pincode: '',
        sellerType: '',
      },

      categoryInfo: {
        primaryCategory: '',
        subCategories: [],
        firstProduct: {
          name: '',
          price: '',
          description: '',
        },
      },

      documents: {
        gstCertificate: null,
        panCard: null,
        businessRegistration: null,
        addressProof: null,
      },

      /* ── Consumer Form State ──────────────────────────────── */
      consumerDetails: {
        interests: [],
        city: '',
        pincode: '',
        companyName: '',
      },

      /* ── Actions ──────────────────────────────────────────── */
      setCurrentStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, s.totalSteps - 1) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

      updateBusinessInfo: (data) =>
        set((s) => ({ businessInfo: { ...s.businessInfo, ...data } })),

      updateLegalInfo: (data) =>
        set((s) => ({ legalInfo: { ...s.legalInfo, ...data } })),

      updateCategoryInfo: (data) =>
        set((s) => ({ categoryInfo: { ...s.categoryInfo, ...data } })),

      updateDocuments: (data) =>
        set((s) => ({ documents: { ...s.documents, ...data } })),

      updateConsumerDetails: (data) =>
        set((s) => ({ consumerDetails: { ...s.consumerDetails, ...data } })),

      /**
       * Check if a specific step is complete
       */
      isStepComplete: (step) => {
        const state = get();
        switch (step) {
          case 0:
            return !!(state.businessInfo.companyName && state.businessInfo.businessType);
          case 1:
            return !!(state.legalInfo.gstNumber && state.legalInfo.panNumber);
          case 2:
            return !!state.categoryInfo.primaryCategory;
          case 3:
            return !!(state.documents.gstCertificate && state.documents.panCard);
          default:
            return false;
        }
      },

      /**
       * Reset all onboarding data
       */
      resetOnboarding: () =>
        set({
          currentStep: 0,
          businessInfo: { companyName: '', businessType: '', yearEstablished: '', numberOfEmployees: '' },
          legalInfo: { gstNumber: '', panNumber: '', businessAddress: '', state: '', city: '', pincode: '', sellerType: '' },
          categoryInfo: { primaryCategory: '', subCategories: [], firstProduct: { name: '', price: '', description: '' } },
          documents: { gstCertificate: null, panCard: null, businessRegistration: null, addressProof: null },
          consumerDetails: { interests: [], city: '', pincode: '', companyName: '' },
        }),
    }),
    {
      name: 'tradelink-onboarding', // localStorage key for save/resume
      partialize: (state) => ({
        currentStep: state.currentStep,
        businessInfo: state.businessInfo,
        legalInfo: state.legalInfo,
        categoryInfo: state.categoryInfo,
        consumerDetails: state.consumerDetails,
        // Don't persist file objects — they can't be serialized
      }),
    }
  )
);

export default useOnboardingStore;
