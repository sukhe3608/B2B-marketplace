/* ============================================================
   TradeLink — Route Guards
   ProtectedRoute and RoleBasedRoute components.
   ============================================================ */
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * ProtectedRoute — requires authentication
 * Redirects to /login if not authenticated, preserving destination.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * RoleBasedRoute — requires specific role
 * Redirects consumer trying to access /seller/* and vice versa.
 */
export function RoleBasedRoute({ children, allowedRole }) {
  const { isAuthenticated, user, onboardingStep } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user hasn't selected a role yet, redirect to role selection
  if (!user?.role) {
    return <Navigate to="/onboarding/role" replace />;
  }

  // If onboarding isn't complete, redirect to appropriate step
  if (onboardingStep === 'role') {
    return <Navigate to="/onboarding/role" replace />;
  }

  if (onboardingStep === 'details') {
    const detailsPath = user.role === 'consumer'
      ? '/onboarding/consumer-details'
      : '/onboarding/seller-details';
    return <Navigate to={detailsPath} replace />;
  }

  // Role mismatch: redirect to correct dashboard
  if (allowedRole && user.role !== allowedRole) {
    const correctDashboard = user.role === 'consumer'
      ? '/consumer/dashboard'
      : '/seller/dashboard';
    return <Navigate to={correctDashboard} replace />;
  }

  return children;
}

/**
 * OnboardingRoute — requires auth but NOT a specific role yet
 */
export function OnboardingRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * GuestRoute — only accessible when NOT authenticated
 * Redirects to dashboard if already logged in.
 */
export function GuestRoute({ children }) {
  const { isAuthenticated, user, onboardingStep } = useAuthStore();

  if (isAuthenticated) {
    if (onboardingStep !== 'complete' || !user?.role) {
      // Still onboarding
      if (!user?.role) return <Navigate to="/onboarding/role" replace />;
      const detailsPath = user.role === 'consumer'
        ? '/onboarding/consumer-details'
        : '/onboarding/seller-details';
      if (onboardingStep === 'details') return <Navigate to={detailsPath} replace />;
    }

    // Fully onboarded — redirect to dashboard
    const dashboardPath = user?.role === 'seller'
      ? '/seller/dashboard'
      : '/consumer/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
}
