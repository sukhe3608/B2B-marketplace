/* ============================================================
   TradeLink — Seller Company Profile & Verification Credentials Page
   ============================================================ */
import { useState } from 'react';
import {
  Building2, ShieldCheck, MapPin, Check, Save, FileText,
  Award, Globe, Upload, Phone, Mail, Users
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import { useAuth } from '../../hooks';
import { BUSINESS_TYPES, INDIAN_STATES, EMPLOYEE_RANGES } from '../../utils/constants';
import './SellerPages.css';

export default function SellerCompanyProfile() {
  const { user } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: user?.companyName || 'ABC Precision Industries Pvt. Ltd.',
    brandName: 'ABC Precision',
    businessType: 'manufacturer',
    gstin: '27AAECB9123F1Z6',
    panNumber: 'AAECB9123F',
    yearEstablished: '2014',
    employeeCount: '51-200',
    website: 'https://abcprecision.demo',
    email: user?.email || 'sales@abcprecision.demo',
    phone: '+91 98230 11223',
    address: 'Plot No. C-14, Phase 2, Chakan Industrial Estate',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '410501',
    description: 'Specialized ISO 9001:2015 certified manufacturer of high-precision CNC turned parts, industrial valves, and engineered cast components.',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <DashboardShell role="seller">
      <div className="subpage-container animate-fade-in-up">
        {/* Header */}
        <div className="subpage-header">
          <div>
            <h1 className="subpage-title">Company Profile & Verification</h1>
            <p className="subpage-subtitle">Your public business catalog visible to thousands of registered buyers.</p>
          </div>
          {saveSuccess && (
            <div className="profile-save-alert animate-fade-in">
              <Check size={16} /> Company profile updated
            </div>
          )}
        </div>

        <div className="profile-sections-grid">
          {/* Main Form */}
          <div className="profile-main-col">
            <div className="card profile-card">
              <div className="profile-card-header">
                <div className="profile-avatar-lg" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                  <Building2 size={36} />
                </div>
                <div className="profile-title-block">
                  <h2 className="profile-name-heading">{formData.companyName}</h2>
                  <p className="profile-role-sub">Manufacturer · Established {formData.yearEstablished} · {formData.city}, {formData.state}</p>
                  <div className="d-flex gap-2 mt-2">
                    <span className="badge badge-success">
                      <ShieldCheck size={12} /> Verified Seller Badge
                    </span>
                    <span className="badge badge-primary">
                      GSTIN Active
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave} className="profile-edit-form">
                <h3 className="profile-section-heading">Legal Entity & Tax Credentials</h3>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Registered Legal Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Trade / Brand Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">GSTIN Number (Govt. Validated)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company PAN</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Primary Business Model</label>
                    <select
                      className="form-select"
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    >
                      {BUSINESS_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of Employees</label>
                    <select
                      className="form-select"
                      value={formData.employeeCount}
                      onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                    >
                      {EMPLOYEE_RANGES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <h3 className="profile-section-heading mt-4">Manufacturing Facility & Works Address</h3>

                <div className="form-group">
                  <label className="form-label">Factory / Office Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <select
                      className="form-select"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group mt-3">
                  <label className="form-label">Company Overview for Buyers</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary mt-4">
                  <Save size={16} /> Save Company Details
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Verification Badges & Certifications */}
          <div className="profile-side-col">
            <div className="card profile-card">
              <h3 className="side-card-title mb-2">Verified Trust Badges</h3>
              <p className="side-card-sub mb-3">Badges earned through government data check & trade verification.</p>

              <div className="trust-badge-card success mb-3">
                <ShieldCheck size={24} className="text-success" />
                <div>
                  <strong>GSTIN Verified Active</strong>
                  <p className="text-xs text-secondary mt-1">Verified via CBIC API with 100% filing compliance</p>
                </div>
              </div>

              <div className="trust-badge-card primary mb-3">
                <Award size={24} className="text-primary" />
                <div>
                  <strong>ISO 9001:2015 Registered</strong>
                  <p className="text-xs text-secondary mt-1">Quality management systems validated</p>
                </div>
              </div>

              <div className="trust-badge-card neutral">
                <Check size={24} className="text-primary" />
                <div>
                  <strong>Bank Account Verified</strong>
                  <p className="text-xs text-secondary mt-1">Instant payouts active via HDFC Escrow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
