/* ============================================================
   TradeLink — App Router
   Central routing configuration with role-based guards.
   ============================================================ */
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleBasedRoute, OnboardingRoute, GuestRoute } from './Guards';

// Public pages
import LandingPage from '../pages/Landing/LandingPage';
import SignupPage from '../pages/Auth/SignupPage';
import LoginPage from '../pages/Auth/LoginPage';

// Onboarding
import RoleSelectPage from '../pages/Onboarding/RoleSelectPage';
import ConsumerDetailsPage from '../pages/Onboarding/ConsumerDetailsPage';
import SellerDetailsPage from '../pages/Onboarding/SellerDetailsPage';

// Consumer pages
import ConsumerDashboard from '../pages/Consumer/Dashboard';
import ConsumerRFQs from '../pages/Consumer/ConsumerRFQs';
import ConsumerSuppliers from '../pages/Consumer/ConsumerSuppliers';
import ConsumerMessages from '../pages/Consumer/ConsumerMessages';
import ConsumerProfile from '../pages/Consumer/ConsumerProfile';
import ConsumerSettings from '../pages/Consumer/ConsumerSettings';

// Seller pages
import SellerDashboard from '../pages/Seller/Dashboard';
import VerificationPage from '../pages/Seller/VerificationPage';
import LimitedDashboard from '../pages/Seller/LimitedDashboard';
import SellerProducts from '../pages/Seller/SellerProducts';
import SellerRFQs from '../pages/Seller/SellerRFQs';
import SellerOrders from '../pages/Seller/SellerOrders';
import SellerCompanyProfile from '../pages/Seller/SellerCompanyProfile';
import SellerSettings from '../pages/Seller/SellerSettings';

// Screen 12 Design System Showcase
import DesignSystemPage from '../pages/DesignSystem/DesignSystemPage';

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        {/* ── Public Routes ──────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/signup"
          element={
            <GuestRoute>
              <SignupPage />
            </GuestRoute>
          }
        />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />

        {/* ── Onboarding Routes ──────────────────────────────── */}
        <Route
          path="/onboarding/role"
          element={
            <OnboardingRoute>
              <RoleSelectPage />
            </OnboardingRoute>
          }
        />

        <Route
          path="/onboarding/consumer-details"
          element={
            <OnboardingRoute>
              <ConsumerDetailsPage />
            </OnboardingRoute>
          }
        />

        <Route
          path="/onboarding/seller-details"
          element={
            <OnboardingRoute>
              <SellerDetailsPage />
            </OnboardingRoute>
          }
        />

        {/* ── Consumer Routes ────────────────────────────────── */}
        <Route
          path="/consumer/dashboard"
          element={
            <RoleBasedRoute allowedRole="consumer">
              <ConsumerDashboard />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/consumer/rfqs"
          element={
            <RoleBasedRoute allowedRole="consumer">
              <ConsumerRFQs />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/consumer/suppliers"
          element={
            <RoleBasedRoute allowedRole="consumer">
              <ConsumerSuppliers />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/consumer/messages"
          element={
            <RoleBasedRoute allowedRole="consumer">
              <ConsumerMessages />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/consumer/profile"
          element={
            <RoleBasedRoute allowedRole="consumer">
              <ConsumerProfile />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/consumer/settings"
          element={
            <RoleBasedRoute allowedRole="consumer">
              <ConsumerSettings />
            </RoleBasedRoute>
          }
        />

        {/* ── Seller Routes ──────────────────────────────────── */}
        <Route
          path="/seller/dashboard"
          element={
            <RoleBasedRoute allowedRole="seller">
              <SellerDashboard />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/seller/verification"
          element={
            <RoleBasedRoute allowedRole="seller">
              <VerificationPage />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/seller/limited"
          element={
            <RoleBasedRoute allowedRole="seller">
              <LimitedDashboard />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/seller/products"
          element={
            <RoleBasedRoute allowedRole="seller">
              <SellerProducts />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/seller/rfqs"
          element={
            <RoleBasedRoute allowedRole="seller">
              <SellerRFQs />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/seller/orders"
          element={
            <RoleBasedRoute allowedRole="seller">
              <SellerOrders />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/seller/company-profile"
          element={
            <RoleBasedRoute allowedRole="seller">
              <SellerCompanyProfile />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/seller/settings"
          element={
            <RoleBasedRoute allowedRole="seller">
              <SellerSettings />
            </RoleBasedRoute>
          }
        />

        {/* ── Screen 12 Design System Showcase ───────────────── */}
        <Route path="/design-system" element={<DesignSystemPage />} />

        {/* ── Catch-all ──────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

