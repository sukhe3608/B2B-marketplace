/* ============================================================
   TradeLink — Seller Verification Page (Screen 7 Wireframe Match)
   Concentric circular shield graphic, status checklist, clean card.
   ============================================================ */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks';
import './SellerPages.css';

const VERIFICATION_STEPS = [
  { id: 'gst', label: 'GST Verification', status: 'completed' },
  { id: 'pan', label: 'PAN Verification', status: 'completed' },
  { id: 'kyc', label: 'Business KYC', status: 'in_progress' },
];

export default function VerificationPage() {
  const { setVerificationStatus } = useAuth();
  const [steps, setSteps] = useState(VERIFICATION_STEPS);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) => (s.id === 'kyc' ? { ...s, status: 'completed' } : s))
      );
      setVerificationStatus('verified');
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="verification-wireframe-page">
      {/* Top Header */}
      <header className="onboarding-top-bar" style={{ justifyContent: 'center' }}>
        <Link to="/" className="role-logo-brand">
          <div className="auth-isometric-logo">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <polygon points="16,3 29,10.5 16,18 3,10.5" fill="#6366F1" />
              <polygon points="3,10.5 16,18 16,29 3,21.5" fill="#4338CA" />
              <polygon points="16,18 29,10.5 29,21.5 16,29" fill="#38BDF8" />
            </svg>
          </div>
          <span className="role-logo-title">TradeLink</span>
        </Link>
      </header>

      {/* Screen 7 Centered Card */}
      <div className="verification-wireframe-card animate-fade-in">
        {/* Concentric Rings with Shield */}
        <div className="concentric-shield-container">
          <div className="shield-ring-outer"></div>
          <div className="shield-ring-middle"></div>
          <div className="shield-center-badge">
            <ShieldCheck size={36} color="#FFFFFF" strokeWidth={2.3} />
          </div>
        </div>

        <h1 className="verification-card-title">Verification in Progress</h1>
        <p className="verification-card-subtitle">
          We're validating your GST, PAN and business details.<br />
          This usually takes 1-2 hours.
        </p>

        {/* Status Checklist matching Screen 7 */}
        <div className="verification-wireframe-checklist">
          {steps.map((s) => (
            <div key={s.id} className="wireframe-status-row">
              <div className="status-row-left">
                {s.status === 'completed' ? (
                  <CheckCircle2 size={20} className="status-icon-check" />
                ) : (
                  <div className="status-icon-in-progress">
                    <Clock size={16} />
                  </div>
                )}
                <span className="status-row-label">{s.label}</span>
              </div>

              <span className={`status-pill ${s.status === 'completed' ? 'completed' : 'in-progress'}`}>
                {s.status === 'completed' ? 'Completed' : 'In Progress'}
              </span>
            </div>
          ))}
        </div>

        {/* Notification Box */}
        <div className="verification-notice-box">
          <p>
            You will be notified once your verification is complete.<br />
            You can close this page and we'll keep you updated.
          </p>
        </div>

        {/* Link to limited dashboard */}
        <Link to="/seller/limited" className="btn-explore-limited">
          Explore Dashboard (Limited Mode) <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

