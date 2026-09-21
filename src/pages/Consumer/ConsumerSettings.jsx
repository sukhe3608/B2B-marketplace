/* ============================================================
   TradeLink — Consumer & Buyer Account Settings Page
   Notification channels, security credentials, and preferences.
   ============================================================ */
import { useState } from 'react';
import {
  Bell, Lock, Shield, Smartphone, Mail, Check,
  AlertTriangle, Save, KeyRound
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import './ConsumerPages.css';

export default function ConsumerSettings() {
  const [notifications, setNotifications] = useState({
    emailQuotes: true,
    emailMarketing: false,
    whatsappQuotes: true,
    smsAlerts: true,
  });

  const [passwordSaved, setPasswordSaved] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  const handleToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.newPass && passwords.newPass === passwords.confirmPass) {
      setPasswordSaved(true);
      setPasswords({ current: '', newPass: '', confirmPass: '' });
      setTimeout(() => setPasswordSaved(false), 3000);
    }
  };

  return (
    <DashboardShell role="consumer">
      <div className="subpage-container animate-fade-in-up">
        <div className="subpage-header">
          <div>
            <h1 className="subpage-title">Account Settings & Security</h1>
            <p className="subpage-subtitle">Configure real-time notification alerts, change login credentials, and manage privacy.</p>
          </div>
          {(settingsSaved || passwordSaved) && (
            <div className="profile-save-alert animate-fade-in">
              <Check size={16} /> Preferences updated
            </div>
          )}
        </div>

        <div className="settings-cards-list">
          {/* Notifications Card */}
          <div className="card settings-section-card">
            <div className="settings-section-header">
              <div className="settings-icon-circle primary">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="settings-card-title">Notification Channels</h3>
                <p className="settings-card-sub">Choose where you receive instant supplier quotes and negotiation updates.</p>
              </div>
            </div>

            <div className="settings-toggle-rows">
              <div className="toggle-row">
                <div className="toggle-info">
                  <div className="toggle-label-row">
                    <Mail size={16} />
                    <strong>Email Quotations</strong>
                  </div>
                  <p className="toggle-desc">Receive full PDF price quotations and supplier brochures via email.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications.emailQuotes}
                    onChange={() => handleToggle('emailQuotes')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-info">
                  <div className="toggle-label-row">
                    <Smartphone size={16} />
                    <strong>WhatsApp Instant Lead Alerts</strong>
                  </div>
                  <p className="toggle-desc">Get an instant WhatsApp notification when a manufacturer submits a competitive bid.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications.whatsappQuotes}
                    onChange={() => handleToggle('whatsappQuotes')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-info">
                  <div className="toggle-label-row">
                    <Shield size={16} />
                    <strong>SMS Dispatch & Security OTPs</strong>
                  </div>
                  <p className="toggle-desc">Required for order verification, delivery pin verification, and password resets.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications.smsAlerts}
                    onChange={() => handleToggle('smsAlerts')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Security & Password Card */}
          <div className="card settings-section-card">
            <div className="settings-section-header">
              <div className="settings-icon-circle accent">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="settings-card-title">Password & Authentication</h3>
                <p className="settings-card-sub">Keep your procurement account secure with a strong password.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="password-form-grid">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="At least 8 characters"
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Repeat new password"
                    value={passwords.confirmPass}
                    onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ width: 'fit-content' }}>
                <Lock size={16} /> Update Password
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="card settings-section-card danger-zone">
            <div className="settings-section-header">
              <div className="settings-icon-circle danger">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="settings-card-title text-error">Deactivate Account</h3>
                <p className="settings-card-sub">Permanently close your buyer account and archive all active quotation threads.</p>
              </div>
            </div>
            <button className="btn btn-danger btn-sm mt-3" onClick={() => alert('Account deactivation request sent to support.')}>
              Deactivate Buyer Account
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
