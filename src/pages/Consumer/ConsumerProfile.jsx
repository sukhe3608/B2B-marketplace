/* ============================================================
   TradeLink — Consumer Profile Management Page
   Buyer personal details, delivery addresses, and business profile.
   ============================================================ */
import { useState } from 'react';
import {
  User, Building2, MapPin, Mail, Phone, Plus, Check,
  Edit2, ShieldCheck, Tag, Save
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import { useAuth } from '../../hooks';
import './ConsumerPages.css';

export default function ConsumerProfile() {
  const { user } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Rahul Sharma',
    email: user?.email || 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    designation: 'Procurement Head',
    companyName: user?.companyName || 'Sharma Industries & Infra',
    gstNumber: '27AABCS1429B1Z8',
    city: 'Mumbai',
    pincode: '400001',
    interests: ['Machinery', 'Industrial Tools', 'Electronics', 'Packaging Materials'],
  });

  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      title: 'Main Warehouse & Inward Dock',
      address: 'Plot 42, MIDC Industrial Area, Taloja, Navi Mumbai',
      city: 'Navi Mumbai, MH — 410208',
      isDefault: true,
    },
    {
      id: 'addr-2',
      title: 'Corporate Procurement Office',
      address: 'Suite 502, Express Towers, Nariman Point',
      city: 'Mumbai, MH — 400021',
      isDefault: false,
    },
  ]);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <DashboardShell role="consumer">
      <div className="subpage-container animate-fade-in-up">
        <div className="subpage-header">
          <div>
            <h1 className="subpage-title">Buyer Profile & Business Info</h1>
            <p className="subpage-subtitle">Manage your contact information, verified addresses, and sourcing preferences.</p>
          </div>
          {savedSuccess && (
            <div className="profile-save-alert animate-fade-in">
              <Check size={16} /> Changes saved successfully
            </div>
          )}
        </div>

        <div className="profile-sections-grid">
          {/* Left Column: Personal & Company Info */}
          <div className="profile-main-col">
            {/* Identity Card */}
            <div className="card profile-card">
              <div className="profile-card-header">
                <div className="profile-avatar-lg">
                  {formData.name.charAt(0)}
                </div>
                <div className="profile-title-block">
                  <h2 className="profile-name-heading">{formData.name}</h2>
                  <p className="profile-role-sub">{formData.designation} at {formData.companyName}</p>
                  <span className="badge badge-success mt-2">
                    <ShieldCheck size={13} /> Verified Buyer Account
                  </span>
                </div>
              </div>

              <form onSubmit={handleSave} className="profile-edit-form">
                <h3 className="profile-section-heading">Contact Details</h3>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation / Role</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <h3 className="profile-section-heading mt-4">Company Details</h3>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Company / Firm Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GSTIN (Validated)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Headquarters City</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary mt-4">
                  <Save size={16} /> Save Profile Changes
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Delivery Addresses & Category Interests */}
          <div className="profile-side-col">
            {/* Delivery Addresses */}
            <div className="card profile-card">
              <div className="side-card-title-row">
                <h3 className="side-card-title">Delivery Locations</h3>
                <button className="btn btn-ghost btn-sm" title="Add address">
                  <Plus size={16} /> Add
                </button>
              </div>

              <div className="addresses-list">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`address-item-card ${addr.isDefault ? 'default' : ''}`}>
                    <div className="address-top-row">
                      <span className="address-title">{addr.title}</span>
                      {addr.isDefault && <span className="default-pill">Default</span>}
                    </div>
                    <p className="address-lines">{addr.address}</p>
                    <span className="address-city">{addr.city}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sourcing Categories */}
            <div className="card profile-card mt-4">
              <h3 className="side-card-title mb-2">Category Interests</h3>
              <p className="side-card-sub mb-3">Suppliers from these categories can send you recommended offers.</p>
              <div className="profile-interests-cloud">
                {formData.interests.map((cat, idx) => (
                  <span key={idx} className="interest-chip">
                    <Tag size={12} /> {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
