/* ============================================================
   TradeLink — VerificationBanner Component
   Displays seller verification status and gates actions.
   ============================================================ */
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, ShieldCheck, ArrowRight } from 'lucide-react';
import './inventory.css';

export default function VerificationBanner({ verificationStatus = 'none' }) {
  // If approved or verified, no banner needed
  if (verificationStatus === 'approved' || verificationStatus === 'verified') {
    return null;
  }

  const isPending =
    verificationStatus === 'pending' ||
    verificationStatus === 'under_review' ||
    verificationStatus === 're_submitted';

  const isRejected = verificationStatus === 'rejected';
  const isSuspended = verificationStatus === 'suspended';

  if (isPending) {
    return (
      <div className="verification-banner banner-warning" role="alert">
        <div className="banner-icon">
          <AlertTriangle size={20} />
        </div>
        <div className="banner-content">
          <strong>Verification In Progress</strong>
          <p>
            Your business profile is under review. You can preview all inventory screens,
            but publishing and editing actions are locked until verification is complete.
          </p>
        </div>
        <Link to="/seller/verification" className="banner-action-link">
          <span>Check Status</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="verification-banner banner-danger" role="alert">
        <div className="banner-icon">
          <ShieldAlert size={20} />
        </div>
        <div className="banner-content">
          <strong>Verification Rejected</strong>
          <p>
            Your verification request was rejected. Your products are currently hidden from
            the customer shop. Please update your documents to regain access.
          </p>
        </div>
        <Link to="/seller/verification" className="banner-action-link">
          <span>Update Documents</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  if (isSuspended) {
    return (
      <div className="verification-banner banner-danger" role="alert">
        <div className="banner-icon">
          <ShieldAlert size={20} />
        </div>
        <div className="banner-content">
          <strong>Seller Account Suspended</strong>
          <p>
            This seller account is temporarily suspended due to policy compliance review.
            All marketplace listings have been suppressed.
          </p>
        </div>
      </div>
    );
  }

  // Not submitted yet
  return (
    <div className="verification-banner banner-info" role="alert">
      <div className="banner-icon">
        <ShieldCheck size={20} />
      </div>
      <div className="banner-content">
        <strong>Complete Seller Verification</strong>
        <p>
          Verify your GSTIN and business documentation to start receiving orders and publishing products to buyers.
        </p>
      </div>
      <Link to="/seller/verification" className="banner-action-link">
        <span>Start Verification</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

