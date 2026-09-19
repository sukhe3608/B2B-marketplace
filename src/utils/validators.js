/* ============================================================
   TradeLink — Validators
   Input validation with Zod schemas + utility functions.
   ============================================================ */
import { z } from 'zod';

/* ── Regex Patterns ───────────────────────────────────────── */
export const PATTERNS = {
  PHONE_IN: /^[6-9]\d{9}$/,
  GST: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
  PAN: /^[A-Z]{5}\d{4}[A-Z]{1}$/,
  PINCODE_IN: /^\d{6}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

/* ── Zod Schemas ──────────────────────────────────────────── */

/** Sign-up form schema */
export const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters, spaces, dots, and hyphens'),
  contact: z
    .string()
    .min(1, 'Mobile number or email is required')
    .refine(
      (val) => PATTERNS.EMAIL.test(val) || PATTERNS.PHONE_IN.test(val),
      'Enter a valid email or 10-digit Indian mobile number'
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[a-z]/, 'Include at least one lowercase letter')
    .regex(/\d/, 'Include at least one number')
    .regex(/[^A-Za-z0-9]/, 'Include at least one special character'),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Terms of Service' }),
  }),
});

/** Login form schema */
export const loginSchema = z.object({
  contact: z
    .string()
    .min(1, 'Mobile number or email is required')
    .refine(
      (val) => PATTERNS.EMAIL.test(val) || PATTERNS.PHONE_IN.test(val),
      'Enter a valid email or 10-digit Indian mobile number'
    ),
  password: z.string().min(1, 'Password is required'),
});

/** Consumer details schema */
export const consumerDetailsSchema = z.object({
  interests: z.array(z.string()).min(1, 'Select at least one category').optional(),
  city: z.string().optional(),
  pincode: z.string().regex(PATTERNS.PINCODE_IN, 'Enter a valid 6-digit pincode').optional().or(z.literal('')),
  companyName: z.string().optional(),
});

/** Seller business info schema (Step A) */
export const sellerBusinessSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  businessType: z.string().min(1, 'Select a business type'),
  yearEstablished: z.string().optional(),
  numberOfEmployees: z.string().optional(),
});

/** Seller legal info schema (Step B) */
export const sellerLegalSchema = z.object({
  gstNumber: z
    .string()
    .min(1, 'GST number is required')
    .regex(PATTERNS.GST, 'Enter a valid 15-character GST number (e.g., 22AAAAA0000A1Z5)'),
  panNumber: z
    .string()
    .min(1, 'PAN number is required')
    .regex(PATTERNS.PAN, 'Enter a valid 10-character PAN (e.g., ABCDE1234F)'),
  businessAddress: z.string().min(5, 'Enter your business address'),
  state: z.string().min(1, 'Select a state'),
  city: z.string().min(1, 'Enter your city'),
  pincode: z.string().regex(PATTERNS.PINCODE_IN, 'Enter a valid 6-digit pincode'),
  sellerType: z.string().optional(),
});

/** Seller category info schema (Step C) */
export const sellerCategorySchema = z.object({
  primaryCategory: z.string().min(1, 'Select a primary category'),
  subCategories: z.array(z.string()).max(3, 'Maximum 3 sub-categories'),
});

/* ── Utility Functions ────────────────────────────────────── */

/**
 * Calculate password strength (0-4 scale)
 */
export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', level: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const levels = ['', 'weak', 'fair', 'strong', 'very-strong'];
  const labels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  return { score, label: labels[score], level: levels[score] };
}

/**
 * Validate GST number format (basic + checksum hint)
 */
export function validateGST(gst) {
  if (!PATTERNS.GST.test(gst)) {
    return { valid: false, message: 'Invalid GST format' };
  }
  // First 2 digits = state code (01-37)
  const stateCode = parseInt(gst.substring(0, 2), 10);
  if (stateCode < 1 || stateCode > 37) {
    return { valid: false, message: 'Invalid state code in GST' };
  }
  return { valid: true, message: 'Valid GST format' };
}

/**
 * Validate PAN number format
 */
export function validatePAN(pan) {
  if (!PATTERNS.PAN.test(pan)) {
    return { valid: false, message: 'Invalid PAN format' };
  }
  return { valid: true, message: 'Valid PAN format' };
}

/**
 * Validate file for upload (type, size)
 */
export function validateFile(file, options = {}) {
  const {
    maxSizeMB = 5,
    allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
  } = options;

  const errors = [];

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not allowed. Use PDF, JPG, or PNG.`);
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    errors.push(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${maxSizeMB}MB.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format phone number for display
 */
export function formatPhone(phone) {
  if (!phone || phone.length !== 10) return phone;
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}

/**
 * Mask sensitive data for display (e.g., GST, PAN)
 */
export function maskSensitive(value, visibleStart = 4, visibleEnd = 2) {
  if (!value || value.length <= visibleStart + visibleEnd) return value;
  const start = value.slice(0, visibleStart);
  const end = value.slice(-visibleEnd);
  const masked = '*'.repeat(value.length - visibleStart - visibleEnd);
  return `${start}${masked}${end}`;
}
