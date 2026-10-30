/* ============================================================
   TradeLink — Seller Verification Page (Full)
   States: no-request → form | pending/under_review | rejected → re-submit | verified
   ============================================================ */
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, ArrowRight, Upload, CheckCircle2, Clock,
  XCircle, AlertTriangle, RotateCcw, FileText, X
} from 'lucide-react';
import { useAuth, useVerificationStatus, useSimulatedLoading } from '../../hooks';
import useVerificationStore from '../../store/verificationStore';
import { REJECTION_ITEMS } from '../../store/verificationStore';
import { Skeleton } from '../../components/common';
import './SellerPages.css';
import './VerificationPage.css';

/* ── helpers ──────────────────────────────────────────────── */

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function UploadSlot({ label, hint, value, onChange, highlight = false }) {
  const inputRef = useRef();
  const fileName = value?.name || (value && 'Uploaded') || null;

  return (
    <div
      className={`vp-upload-slot ${highlight ? 'vp-upload-slot--flagged' : ''} ${fileName ? 'vp-upload-slot--filled' : ''}`}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={(e) => onChange(e.target.files[0] || null)}
      />
      <div className="vp-upload-icon">
        {fileName ? <CheckCircle2 size={20} className="vp-upload-check" /> : <Upload size={20} />}
      </div>
      <div className="vp-upload-text">
        <span className="vp-upload-label">{label}</span>
        <span className="vp-upload-hint">{fileName || hint}</span>
      </div>
      {highlight && <span className="vp-flagged-pill">Flagged</span>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:      { label: 'Pending Review',  cls: 'vp-badge--pending'  },
    under_review: { label: 'Under Review',    cls: 'vp-badge--review'   },
    re_submitted: { label: 'Re-submitted',    cls: 'vp-badge--review'   },
    verified:     { label: 'Verified',        cls: 'vp-badge--verified' },
    rejected:     { label: 'Rejected',        cls: 'vp-badge--rejected' },
  };
  const { label, cls } = map[status] || { label: status, cls: '' };
  return <span className={`vp-status-badge ${cls}`}>{label}</span>;
}

/* ── sub-views ────────────────────────────────────────────── */

/** View: pending / under_review / re_submitted */
function PendingView({ request }) {
  const steps = [
    { id: 'gst', label: 'GST Verification' },
    { id: 'pan', label: 'PAN Verification' },
    { id: 'kyc', label: 'Business KYC'     },
  ];
  const done = request?.status === 'under_review' || request?.status === 're_submitted';

  return (
    <div className="vp-state-card animate-fade-in">
      {/* Shield graphic */}
      <div className="concentric-shield-container">
        <div className="shield-ring-outer" />
        <div className="shield-ring-middle" />
        <div className="shield-center-badge">
          <ShieldCheck size={36} color="#FFFFFF" strokeWidth={2.3} />
        </div>
      </div>
      <h1 className="verification-card-title">Verification in Progress</h1>
      <p className="verification-card-subtitle">
        We're validating your GST, PAN and business details.<br />
        This usually takes 1–2 business hours.
      </p>
      <StatusBadge status={request?.status} />

      <div className="verification-wireframe-checklist" style={{ marginTop: 24 }}>
        {steps.map((s) => (
          <div key={s.id} className="wireframe-status-row">
            <div className="status-row-left">
              {done
                ? <Clock size={20} className="status-icon-in-progress" />
                : <CheckCircle2 size={20} className="status-icon-check" />}
              <span className="status-row-label">{s.label}</span>
            </div>
            <span className={`status-pill ${done ? 'in-progress' : 'completed'}`}>
              {done ? 'In Review' : 'Submitted'}
            </span>
          </div>
        ))}
      </div>

      <div className="verification-notice-box">
        <p>
          You will be notified once your verification is complete.<br />
          You can close this page and we'll keep you updated.
        </p>
      </div>

      <Link to="/seller/limited" className="btn-explore-limited">
        Explore Dashboard (Limited Mode) <ArrowRight size={16} />
      </Link>
    </div>
  );
}

/** View: rejected — shows flagged items + opens re-submit form */
function RejectedView({ request, onResubmit }) {
  const flaggedLabels = (request.rejectedItems || []).map(
    (id) => REJECTION_ITEMS.find((r) => r.id === id)?.label || id
  );

  return (
    <div className="vp-state-card vp-state-card--rejected animate-fade-in">
      <div className="vp-rejected-icon">
        <XCircle size={40} strokeWidth={1.8} />
      </div>
      <h1 className="vp-rejected-title">Verification Rejected</h1>
      <p className="vp-rejected-subtitle">
        Our team reviewed your submission and found the following issues.
        Please fix them and resubmit.
      </p>

      {flaggedLabels.length > 0 && (
        <div className="vp-rejection-issues">
          <div className="vp-rejection-issues-header">
            <AlertTriangle size={16} /> Issues Found
          </div>
          <ul className="vp-rejection-list">
            {flaggedLabels.map((label) => (
              <li key={label}>
                <X size={14} className="vp-rejection-x" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {request.rejectionNote && (
        <div className="vp-rejection-note">
          <FileText size={14} />
          <p>{request.rejectionNote}</p>
        </div>
      )}

      <button className="btn btn-primary vp-resubmit-btn" onClick={onResubmit}>
        <RotateCcw size={16} /> Fix &amp; Resubmit
      </button>

      <Link to="/seller/limited" className="btn-explore-limited" style={{ marginTop: 12 }}>
        Back to Dashboard
      </Link>
    </div>
  );
}

/** View: submit / re-submit form */
function SubmitForm({ request, onSubmitted }) {
  const { user } = useAuth();
  const submitRequest = useVerificationStore((s) => s.submitRequest);
  const isResubmit = request?.status === 'rejected';

  // Determine which doc fields are flagged (must be re-uploaded)
  const flaggedDocs = new Set(
    (request?.rejectedItems || [])
      .map((id) => REJECTION_ITEMS.find((r) => r.id === id)?.doc)
      .filter(Boolean)
  );

  const [gstNumber, setGstNumber] = useState(request?.gstNumber || '');
  const [panNumber, setPanNumber] = useState(request?.panNumber || '');
  const [gstFile, setGstFile]     = useState(null);
  const [panFile, setPanFile]     = useState(null);
  const [kycFile, setKycFile]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // For re-submit: check if all flagged docs are re-uploaded
  const flaggedFulfilled = () => {
    if (!isResubmit) return true;
    if (flaggedDocs.has('gst') && !gstFile) return false;
    if (flaggedDocs.has('pan') && !panFile) return false;
    if (flaggedDocs.has('kyc') && !kycFile) return false;
    return true;
  };

  // For fresh submit: all three docs required
  const freshFulfilled = () => gstNumber.trim() && panNumber.trim() && gstFile && panFile && kycFile;

  const canSubmit = isResubmit ? flaggedFulfilled() : freshFulfilled();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');

    try {
      const docs = { ...request?.documents };
      if (gstFile) docs.gst = await fileToBase64(gstFile);
      if (panFile) docs.pan = await fileToBase64(panFile);
      if (kycFile) docs.kyc = await fileToBase64(kycFile);

      submitRequest(user, {
        gstNumber: gstNumber || request?.gstNumber,
        panNumber: panNumber || request?.panNumber,
        documents: docs,
      });

      onSubmitted();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vp-form-card animate-fade-in">
      <div className="vp-form-header">
        <div className="vp-form-header-icon">
          <ShieldCheck size={28} strokeWidth={2} />
        </div>
        <div>
          <h1 className="vp-form-title">
            {isResubmit ? 'Fix & Resubmit Verification' : 'Verify Your Business'}
          </h1>
          <p className="vp-form-subtitle">
            {isResubmit
              ? 'Re-upload the flagged documents to continue.'
              : 'Provide your GST, PAN and KYC documents to unlock the full marketplace.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="vp-form">
        {/* GST */}
        <div className="vp-field-group">
          <label className="vp-label">
            GST Number
            {isResubmit && !flaggedDocs.has('gst') && (
              <span className="vp-accepted-pill">✓ Accepted</span>
            )}
          </label>
          <input
            className="vp-input"
            placeholder="e.g. 27AABCU9603R1ZX"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
            disabled={isResubmit && !flaggedDocs.has('gst')}
            maxLength={15}
          />
          {(!isResubmit || flaggedDocs.has('gst')) && (
            <UploadSlot
              label="Upload GST Certificate"
              hint="PDF, JPG or PNG — max 5 MB"
              value={gstFile}
              onChange={setGstFile}
              highlight={isResubmit && flaggedDocs.has('gst')}
            />
          )}
        </div>

        {/* PAN */}
        <div className="vp-field-group">
          <label className="vp-label">
            PAN Number
            {isResubmit && !flaggedDocs.has('pan') && (
              <span className="vp-accepted-pill">✓ Accepted</span>
            )}
          </label>
          <input
            className="vp-input"
            placeholder="e.g. AABCU9603R"
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
            disabled={isResubmit && !flaggedDocs.has('pan')}
            maxLength={10}
          />
          {(!isResubmit || flaggedDocs.has('pan')) && (
            <UploadSlot
              label="Upload PAN Card"
              hint="PDF, JPG or PNG — max 5 MB"
              value={panFile}
              onChange={setPanFile}
              highlight={isResubmit && flaggedDocs.has('pan')}
            />
          )}
        </div>

        {/* KYC */}
        <div className="vp-field-group">
          <label className="vp-label">
            Business KYC Document
            {isResubmit && !flaggedDocs.has('kyc') && (
              <span className="vp-accepted-pill">✓ Accepted</span>
            )}
          </label>
          {(!isResubmit || flaggedDocs.has('kyc')) && (
            <UploadSlot
              label="Upload Business KYC"
              hint="Company registration / trade license — PDF, JPG or PNG"
              value={kycFile}
              onChange={setKycFile}
              highlight={isResubmit && flaggedDocs.has('kyc')}
            />
          )}
        </div>

        {error && <p className="vp-error">{error}</p>}

        {isResubmit && !flaggedFulfilled() && (
          <p className="vp-resubmit-lock-hint">
            ⚠ Re-upload all flagged documents above to enable submission.
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary vp-submit-btn"
          disabled={!canSubmit || submitting}
        >
          {submitting
            ? 'Submitting…'
            : isResubmit
              ? 'Resubmit for Verification'
              : 'Submit for Verification'}
          <ArrowRight size={16} />
        </button>
      </form>

      <Link to="/seller/limited" className="btn-explore-limited" style={{ marginTop: 8 }}>
        Skip for now — Explore Limited Dashboard
      </Link>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────── */

export default function VerificationPage() {
  const { user } = useAuth();
  const { request, isRejected, isPending, isVerified } = useVerificationStatus();
  const [isLoading] = useSimulatedLoading(400);
  const [showForm, setShowForm] = useState(false);

  // After submit → show pending view
  const handleSubmitted = () => setShowForm(false);

  /* ── determine which view to render ── */
  const renderContent = () => {
    // No request yet or explicitly showing form
    if (!request || showForm) {
      return <SubmitForm request={request} onSubmitted={handleSubmitted} />;
    }
    if (isRejected) {
      return <RejectedView request={request} onResubmit={() => setShowForm(true)} />;
    }
    if (isVerified) {
      // Redirect to full dashboard (guard handles this, but fallback)
      return (
        <div className="vp-state-card animate-fade-in" style={{ textAlign: 'center' }}>
          <CheckCircle2 size={60} color="#10B981" strokeWidth={1.5} style={{ margin: '0 auto 16px' }} />
          <h1 className="vp-form-title">You're Verified! 🎉</h1>
          <p className="vp-form-subtitle">Your account is fully verified. Welcome to TradeLink.</p>
          <Link to="/seller/dashboard" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex', gap: 8 }}>
            Go to Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      );
    }
    // pending / under_review / re_submitted
    if (isPending) {
      return <PendingView request={request} />;
    }
    // Fallback: show form
    return <SubmitForm request={request} onSubmitted={handleSubmitted} />;
  };

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

      <div className="vp-page-content">
        {isLoading ? (
          <div className="vp-form-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Skeleton variant="circular" width={72} height={72} />
              <Skeleton variant="rounded" width={260} height={28} />
              <Skeleton variant="text" width={320} height={14} />
              <Skeleton variant="rounded" width="100%" height={52} />
              <Skeleton variant="rounded" width="100%" height={52} />
              <Skeleton variant="rounded" width="100%" height={52} />
              <Skeleton variant="rounded" width="100%" height={48} />
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}
