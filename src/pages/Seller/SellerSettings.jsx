/* ============================================================
   TradeLink — Seller Settings & Bank Payouts Page
   Escrow bank account, lead distribution, and team access.
   ============================================================ */
import { useState } from 'react';
import {
  CreditCard, Users, Bell, Lock, Check, ShieldCheck,
  Smartphone, Mail, Save, AlertTriangle, KeyRound, Building
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import './SellerPages.css';

export default function SellerSettings() {
  const [saveAlert, setSaveAlert] = useState(false);

  const [bankDetails, setBankDetails] = useState({
    accountName: 'ABC Precision Industries Pvt Ltd',
    accountNumber: '•••• •••• •••• 9842',
    ifsc: 'HDFC0000128',
    bankName: 'HDFC Bank Ltd., Chakan Branch',
  });

  const [teamMembers] = useState([
    { name: 'Amit Verma', email: 'amit@abcprecision.demo', role: 'Account Owner', active: true },
    { name: 'Priya Nair', email: 'priya.sales@abcprecision.demo', role: 'Sales & Inquiries', active: true },
    { name: 'Karan Joshi', email: 'karan.ops@abcprecision.demo', role: 'Dispatch & Logistics', active: true },
  ]);

  const [leadAlerts, setLeadAlerts] = useState({
    whatsappInstant: true,
    emailDailyDigest: true,
    smsDispatches: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  return (
    <DashboardShell role="seller">
      <div className="subpage-container animate-fade-in-up">
        {/* Header */}
        <div className="subpage-header">
          <div>
            <h1 className="subpage-title">Seller Account & Payout Settings</h1>
            <p className="subpage-subtitle">Configure bank payout accounts for escrow settlement, manage sales team access, and lead alert notifications.</p>
          </div>
          {saveAlert && (
            <div className="profile-save-alert animate-fade-in">
              <Check size={16} /> Payout preferences saved
            </div>
          )}
        </div>

        <div className="settings-cards-list">
          {/* Bank Account for Escrow Settlement */}
          <div className="card settings-section-card">
            <div className="settings-section-header">
              <div className="settings-icon-circle success">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="settings-card-title">Bank Settlement Account (Escrow Payouts)</h3>
                <p className="settings-card-sub">Funds from delivered buyer orders will be credited to this verified commercial account.</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="profile-edit-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Beneficiary Account Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bank & Branch</label>
                  <input
                    type="text"
                    className="form-input"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Bank Account Number (Masked)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={bankDetails.accountNumber}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">IFSC Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={bankDetails.ifsc}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }}>
                <Save size={15} /> Update Bank Account
              </button>
            </form>
          </div>

          {/* Sales Team Members */}
          <div className="card settings-section-card">
            <div className="settings-section-header">
              <div className="settings-icon-circle primary">
                <Users size={20} />
              </div>
              <div>
                <h3 className="settings-card-title">Team Access & Sub-Logins</h3>
                <p className="settings-card-sub">Authorize team members to answer buyer RFQs and update production dispatch status.</p>
              </div>
            </div>

            <div className="team-members-list">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="team-member-row">
                  <div className="team-member-info">
                    <strong>{member.name}</strong>
                    <span className="text-xs text-secondary">{member.email}</span>
                  </div>
                  <span className="badge badge-neutral">{member.role}</span>
                  <span className="badge badge-success">Active</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Alerts */}
          <div className="card settings-section-card">
            <div className="settings-section-header">
              <div className="settings-icon-circle accent">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="settings-card-title">Lead Alerts & WhatsApp Notification</h3>
                <p className="settings-card-sub">Fast response to buyer inquiries gives 3x higher conversion rate.</p>
              </div>
            </div>

            <div className="settings-toggle-rows">
              <div className="toggle-row">
                <div className="toggle-info">
                  <div className="toggle-label-row">
                    <Smartphone size={16} />
                    <strong>WhatsApp Instant Buyer RFQ Ping</strong>
                  </div>
                  <p className="toggle-desc">Forward every new matching RFQ directly to sales team WhatsApp number.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={leadAlerts.whatsappInstant}
                    onChange={() => setLeadAlerts({ ...leadAlerts, whatsappInstant: !leadAlerts.whatsappInstant })}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-info">
                  <div className="toggle-label-row">
                    <Mail size={16} />
                    <strong>Daily Morning Sourcing Digest</strong>
                  </div>
                  <p className="toggle-desc">Daily 8:00 AM summary of all pending inquiries and dispatched orders.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={leadAlerts.emailDailyDigest}
                    onChange={() => setLeadAlerts({ ...leadAlerts, emailDailyDigest: !leadAlerts.emailDailyDigest })}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
