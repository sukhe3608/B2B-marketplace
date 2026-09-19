/* ============================================================
   TradeLink — Login Page (Screen 10 Wireframe Match)
   Left: Clean login form
   Right: Dark enterprise trust panel with warehouse photography
   ============================================================ */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ShieldCheck, Lock, TrendingUp } from 'lucide-react';
import { loginSchema } from '../../utils/validators';
import { useAuth } from '../../hooks';
import heroBannerImg from '../../assets/hero-banner.jpg';
import './AuthPages.css';

const MOCK_USERS = [
  { contact: 'consumer@demo.com', password: 'Demo@1234', role: 'consumer', name: 'Rahul Kumar' },
  { contact: 'seller@demo.com',   password: 'Demo@1234', role: 'seller',   name: 'Amit Traders' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setRole, completeOnboarding } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const from = location.state?.from?.pathname || null;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { contact: '', password: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError('');
    await new Promise((r) => setTimeout(r, 600));

    const matched = MOCK_USERS.find(
      (u) => u.contact === data.contact && u.password === data.password
    );

    if (matched) {
      const userData = {
        id: 'usr_' + Date.now(),
        name: matched.name,
        contact: matched.contact,
        role: matched.role,
        email: matched.contact,
      };
      login(userData);
      setRole(matched.role);
      completeOnboarding();
      const dest = from || (matched.role === 'seller' ? '/seller/dashboard' : '/consumer/dashboard');
      navigate(dest, { replace: true });
    } else {
      setLoginError('Invalid credentials. Demo: consumer@demo.com / Demo@1234 or seller@demo.com / Demo@1234');
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-modal-card login-wireframe-card animate-fade-in">
        {/* Left Side: Login Form matching Screen 10 */}
        <div className="login-form-side">
          <Link to="/" className="auth-logo-row">
            <div className="auth-isometric-logo">
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                <polygon points="16,3 29,10.5 16,18 3,10.5" fill="#6366F1" />
                <polygon points="3,10.5 16,18 16,29 3,21.5" fill="#4338CA" />
                <polygon points="16,18 29,10.5 29,21.5 16,29" fill="#38BDF8" />
              </svg>
            </div>
            <span className="auth-logo-title">TradeLink</span>
          </Link>

          <div className="login-heading-group">
            <h1 className="login-title">Welcome Back!</h1>
            <p className="login-subtitle">Login to your account</p>
          </div>

          {loginError && (
            <div className="login-error-badge">
              {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form-body" id="login-form">
            {/* Mobile Number or Email */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="login-contact">
                Mobile Number or Email
              </label>
              <input
                id="login-contact"
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
              <div className="password-label-row">
                <label className="auth-field-label" htmlFor="login-password">
                  Password
                </label>
                <a href="#forgot" className="forgot-password-link">
                  Forgot password?
                </a>
              </div>
              <div className="auth-password-container">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`auth-field-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter password"
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

            {/* Login Primary Button */}
            <button
              type="submit"
              className="auth-btn-primary"
              disabled={isLoading}
              id="login-submit-btn"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Divider with 'or' */}
          <div className="auth-divider-line">
            <span>or</span>
          </div>

          {/* Google Button */}
          <button type="button" className="auth-btn-google" id="login-google-btn">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Switch to Signup */}
          <p className="auth-switch-text">
            New to TradeLink? <Link to="/signup" className="auth-switch-link">Create an account</Link>
          </p>
        </div>

        {/* Right Side: Dark Trust Panel matching Screen 10 */}
        <div className="login-trust-side">
          <div className="login-trust-backdrop">
            <img src={heroBannerImg} alt="Logistics warehouse" className="login-trust-bg-img" />
            <div className="login-trust-overlay"></div>
          </div>

          <div className="login-trust-content">
            <h2 className="login-trust-title">
              Trusted by 5M+ businesses<br />across India
            </h2>

            <div className="login-trust-list">
              <div className="login-trust-item">
                <div className="login-trust-icon-box">
                  <ShieldCheck size={18} />
                </div>
                <span>Verified Suppliers</span>
              </div>
              <div className="login-trust-item">
                <div className="login-trust-icon-box">
                  <Lock size={18} />
                </div>
                <span>Secure Transactions</span>
              </div>
              <div className="login-trust-item">
                <div className="login-trust-icon-box">
                  <TrendingUp size={18} />
                </div>
                <span>Better Business Growth</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

