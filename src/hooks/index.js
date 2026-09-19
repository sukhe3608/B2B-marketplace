/* ============================================================
   TradeLink — Custom Hooks
   Reusable hooks for auth, role, debounce, and responsive.
   ============================================================ */
import { useState, useEffect, useCallback, useRef } from 'react';
import useAuthStore from '../store/authStore';

/**
 * useAuth — convenient wrapper around auth store
 */
export function useAuth() {
  const store = useAuthStore();
  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    verificationStatus: store.verificationStatus,
    onboardingStep: store.onboardingStep,
    login: store.login,
    signup: store.signup,
    logout: store.logout,
    setRole: store.setRole,
    updateProfile: store.updateProfile,
    completeOnboarding: store.completeOnboarding,
    setVerificationStatus: store.setVerificationStatus,
    isConsumer: store.user?.role === 'consumer',
    isSeller: store.user?.role === 'seller',
    isVerifiedSeller: store.user?.role === 'seller' && store.verificationStatus === 'verified',
  };
}

/**
 * useRole — role-checking utilities
 */
export function useRole() {
  const { user, verificationStatus } = useAuthStore();

  return {
    role: user?.role || null,
    isConsumer: user?.role === 'consumer',
    isSeller: user?.role === 'seller',
    isVerified: verificationStatus === 'verified',
    isPending: verificationStatus === 'pending' || verificationStatus === 'under_review',
    isRejected: verificationStatus === 'rejected',
    hasRole: !!user?.role,
    canAccessSellerFeatures: user?.role === 'seller' && verificationStatus === 'verified',
  };
}

/**
 * useDebounce — debounce a value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useMediaQuery — responsive breakpoint detection
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * useBreakpoint — semantic breakpoint helpers
 */
export function useBreakpoint() {
  const isMobile = useMediaQuery('(max-width: 480px)');
  const isTablet = useMediaQuery('(min-width: 481px) and (max-width: 768px)');
  const isLaptop = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  return { isMobile, isTablet, isLaptop, isDesktop };
}

/**
 * useClickOutside — detect clicks outside a ref
 */
export function useClickOutside(ref, callback) {
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
}

/**
 * useCountUp — animated count-up for stats
 */
export function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const numericEnd = parseInt(String(end).replace(/[^0-9]/g, ''), 10);
    if (isNaN(numericEnd)) {
      setCount(end);
      return;
    }

    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * numericEnd));
      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate);
      }
    };

    countRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(countRef.current);
  }, [end, duration]);

  return count;
}

/**
 * useLocalStorage — persist state to localStorage
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('useLocalStorage error:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * useToast — simple toast notification management
 */
let toastId = 0;
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
