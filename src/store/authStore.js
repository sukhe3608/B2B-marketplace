/* ============================================================
   TradeLink — Zustand Auth Store
   Manages authentication, user profile, role, and verification.
   ============================================================ */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      /* ── State ────────────────────────────────────────────── */
      user: null,
      token: null,
      isAuthenticated: false,
      verificationStatus: 'none', // none | pending | under_review | verified | rejected
      onboardingStep: 'signup',   // signup | role | details | complete

      /* ── Actions ──────────────────────────────────────────── */

      /**
       * Simulate login — sets user + token
       */
      login: (userData, token = 'mock-jwt-token-' + Date.now()) => {
        set({
          user: userData,
          token,
          isAuthenticated: true,
        });
      },

      /**
       * Simulate signup — creates new user with minimal data
       */
      signup: (name, contact, password) => {
        const user = {
          id: 'usr_' + Date.now(),
          name,
          contact,
          email: contact.includes('@') ? contact : null,
          phone: !contact.includes('@') ? contact : null,
          role: null,
          avatar: null,
          createdAt: new Date().toISOString(),
        };
        set({
          user,
          token: 'mock-jwt-token-' + Date.now(),
          isAuthenticated: true,
          onboardingStep: 'role',
        });
        return user;
      },

      /**
       * Set the user's role (consumer / seller) after role selection
       */
      setRole: (role) => {
        set((state) => ({
          user: { ...state.user, role },
          onboardingStep: 'details',
        }));
      },

      /**
       * Update user profile with additional details
       */
      updateProfile: (profileData) => {
        set((state) => ({
          user: { ...state.user, ...profileData },
        }));
      },

      /**
       * Complete onboarding — marks user as fully onboarded
       */
      completeOnboarding: () => {
        set({ onboardingStep: 'complete' });
      },

      /**
       * Set seller verification status
       */
      setVerificationStatus: (status) => {
        set({ verificationStatus: status });
      },

      /**
       * Logout — clears all auth state
       */
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          verificationStatus: 'none',
          onboardingStep: 'signup',
        });
      },

      /* ── Computed helpers (accessed via get()) ────────────── */
      isConsumer: () => get().user?.role === 'consumer',
      isSeller: () => get().user?.role === 'seller',
      isVerifiedSeller: () =>
        get().user?.role === 'seller' && get().verificationStatus === 'verified',
      needsOnboarding: () => get().onboardingStep !== 'complete',
    }),
    {
      name: 'tradelink-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        verificationStatus: state.verificationStatus,
        onboardingStep: state.onboardingStep,
      }),
    }
  )
);

export default useAuthStore;
