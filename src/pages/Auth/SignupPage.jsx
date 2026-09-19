/* ============================================================
   TradeLink — Sign Up Page (Screen 2 Wireframe Match)
   Modal-card layout: light branding & parcels illustration left,
   clean 3-field form right.
   ============================================================ */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Store, ShieldCheck, Lock, Headphones } from 'lucide-react';
import { signupSchema } from '../../utils/validators';
import { useAuth } from '../../hooks';
import OTPModal from './OTPModal';
import signupParcelsImg from '../../assets/signup-parcels.jpg';
import './AuthPages.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', contact: '', password: '', agreeTerms: true },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    setShowOTP(true);
    window.__signupData = data;
  };

  const handleOTPVerified = () => {
    const data = window.__signupData;
    if (data) {
      signup(data.fullName, data.contact, data.password);
      delete window.__signupData;
      navigate('/onboarding/role');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-modal-card animate-fade-in">
        {/* Left Side — Branding & Value Props matching Wireframe Screen 2 */}
        <div className="auth-brand-side">
          <div className="auth-brand-top">
            {/* 3D Isometric Logo */}
            <Link to="/" className="auth-logo-row">
              <div className="auth-isometric-logo">
                <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                  {/* Top face */}
                  <polygon points="16,3 29,10.5 16,18 3,10.5" fill="#6366F1" />
                  {/* Left face */}
                  <polygon points="3,10.5 16,18 16,29 3,21.5" fill="#4338CA" />
                  {/* Right face */}
                  <polygon points="16,18 29,10.5 29,21.5 16,29" fill="#38BDF8" />
                </svg>
              </div>
              <span className="auth-logo-title">TradeLink</span>
            </Link>

            {/* Exact 3-line heading */}
            <h1 className="auth-brand-heading">
              Your Business<br />
              Journey Starts<br />
              Here
            </h1>

            {/* Subtitle */}
            <p className="auth-brand-sub">
              Join thousands of businesses<br />
              already growing with us.
            </p>

            {/* Features list matching wireframe */}
            <div className="auth-features-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon-wrap">
                  <ShieldCheck size={16} strokeWidth={2.2} />
                </div>
                <span>Verified Suppliers</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon-wrap">
                  <Lock size={15} strokeWidth={2.2} />
                </div>
                <span>Secure Transactions</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon-wrap">
                  <Headphones size={16} strokeWidth={2.2} />
                </div>
                <span>Dedicated Support</span>
              </div>
            </div>
          </div>

          {/* Logistics parcels illustration matching wireframe */}
          <div className="auth-parcels-illustration">
            <img
              src={signupParcelsImg}
              alt="TradeLink business delivery and growth"
              className="auth-parcels-graphic"
            />
          </div>
        </div>

        {/* Right Side — Elevated White Form Card matching Wireframe */}
        <div className="auth-form-side">
          <div className="auth-form-card">
            <div className="auth-form-header">
              <h2 className="auth-form-title">Create your account</h2>
              <p className="auth-form-subtitle">It only takes a minute</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form-body" id="signup-form">
              {/* Full Name */}
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="signup-name">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  className={`auth-field-input ${errors.fullName ? 'error' : ''}`}
                  placeholder="Enter your full name"
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <span className="auth-field-error">{errors.fullName.message}</span>
                )}
              </div>

              {/* Mobile Number or Email */}
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="signup-contact">
                  Mobile Number or Email
                </label>
                <input
                  id="signup-contact"
                  type="text"
                  className={`auth-field-input ${errors.contact ? 'error' : ''}`}
                  placeholder="Enter mobile number or email"
                  {...register('contact')}
                />
                {errors.contact && (
                  <span className="auth-field-error">{errors.contact.message}</span>
                )}
              </div>

              {/* Password */}
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="signup-password">
                  Password
                </label>
                <div className="auth-password-container">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`auth-field-input ${errors.password ? 'error' : ''}`}
                    placeholder="Create a strong password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="auth-eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="auth-field-error">{errors.password.message}</span>
                )}
              </div>

              {/* Sign Up Primary Button */}
              <button
                type="submit"
                className="auth-btn-primary"
                disabled={isLoading}
                id="signup-submit-btn"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            {/* Divider with 'or' */}
            <div className="auth-divider-line">
              <span>or</span>
            </div>

            {/* Google Button */}
            <button type="button" className="auth-btn-google" id="signup-google-btn">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Login Switch */}
            <p className="auth-switch-text">
              Already have an account? <Link to="/login" className="auth-switch-link">Login</Link>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOTP && (
        <OTPModal
          onVerify={handleOTPVerified}
          onClose={() => setShowOTP(false)}
        />
      )}
    </div>
  );
}
