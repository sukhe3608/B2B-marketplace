/* ============================================================
   TradeLink — SellerCard Component
   Displays seller profile details, trust badges, and location.
   ============================================================ */
import React from 'react';
import { ShieldCheck, MapPin, Building, Star, Clock } from 'lucide-react';
import './shop.css';

export default function SellerCard({ seller }) {
  if (!seller) return null;

  const isVerified = seller.verificationStatus === 'approved' || seller.verificationStatus === 'verified';

  return (
    <div className="seller-profile-card">
      <div className="seller-card-header">
        <div className="seller-avatar">
          <Building size={20} color="var(--color-primary, #4F46E5)" />
        </div>
        <div className="seller-main-meta">
          <div className="seller-name-row">
            <h4 className="seller-title">{seller.name}</h4>
            {isVerified && (
              <span className="seller-verified-tag" title="Verified TradeLink Supplier">
                <ShieldCheck size={14} />
                <span>Verified</span>
              </span>
            )}
          </div>
          {seller.city && (
            <div className="seller-location-sub">
              <MapPin size={13} />
              <span>{seller.city}</span>
            </div>
          )}
        </div>
      </div>

      <div className="seller-trust-metrics">
        <div className="trust-metric-item">
          <span className="metric-icon"><Star size={13} fill="#F59E0B" color="#F59E0B" /></span>
          <span className="metric-val">{seller.rating || '4.8'}</span>
          <span className="metric-label">Supplier Rating</span>
        </div>
        <div className="trust-metric-item">
          <span className="metric-icon"><Clock size={13} color="#10B981" /></span>
          <span className="metric-val">{seller.responseTime || '< 2 hrs'}</span>
          <span className="metric-label">Response Time</span>
        </div>
      </div>
    </div>
  );
}

