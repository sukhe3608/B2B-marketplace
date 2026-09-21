/* ============================================================
   TradeLink — Consumer Saved & Verified Suppliers Directory
   Search, filter, inspect verified business credentials, and inquire.
   ============================================================ */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Search, Star, MapPin, ShieldCheck, CheckCircle2,
  Clock, Package, MessageSquare, ExternalLink, Filter, Building2, PhoneCall
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import { MOCK_SUPPLIERS, CATEGORIES } from '../../utils/constants';
import './ConsumerPages.css';

export default function ConsumerSuppliers() {
  const [suppliers, setSuppliers] = useState(MOCK_SUPPLIERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedSupplierIds, setSavedSupplierIds] = useState(['sup-001', 'sup-002']);
  const [contactModalSupplier, setContactModalSupplier] = useState(null);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const toggleSaveSupplier = (id) => {
    setSavedSupplierIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const filteredSuppliers = suppliers.filter((sup) => {
    const matchesCategory =
      selectedCategory === 'All' || sup.categories.includes(selectedCategory);
    const matchesSearch =
      sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sup.primaryProducts.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sup.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSendInquiry = (e) => {
    e.preventDefault();
    setInquirySuccess(true);
    setTimeout(() => {
      setInquirySuccess(false);
      setContactModalSupplier(null);
    }, 2000);
  };

  return (
    <DashboardShell role="consumer">
      <div className="subpage-container animate-fade-in-up">
        {/* Header */}
        <div className="subpage-header">
          <div>
            <h1 className="subpage-title">Verified Suppliers Directory</h1>
            <p className="subpage-subtitle">Connect with GST-validated manufacturers, wholesalers, and distributors across India.</p>
          </div>
          <div className="header-stat-pill">
            <ShieldCheck size={18} className="text-success" />
            <span><strong>{suppliers.length}</strong> Verified Partners</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="suppliers-filter-container">
          <div className="filter-search-box flex-1">
            <Search size={18} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search by company name, product (e.g. CNC, LED, Boxes), or city..."
              className="filter-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="supplier-category-pills">
            {['All', 'Machinery', 'Electronics', 'Packaging Materials', 'Textiles', 'Industrial Tools'].map((cat) => (
              <button
                key={cat}
                className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="suppliers-cards-grid">
          {filteredSuppliers.map((sup) => {
            const isSaved = savedSupplierIds.includes(sup.id);
            return (
              <div key={sup.id} className="card supplier-card">
                <div className="supplier-card-header">
                  <div className="supplier-logo-box">
                    <Building2 size={24} />
                  </div>
                  <div className="supplier-info-header">
                    <div className="supplier-title-row">
                      <h3 className="supplier-name">{sup.name}</h3>
                      <button
                        className={`btn-save-supplier ${isSaved ? 'saved' : ''}`}
                        onClick={() => toggleSaveSupplier(sup.id)}
                        title={isSaved ? 'Saved in favorites' : 'Save supplier'}
                      >
                        <Heart size={18} fill={isSaved ? '#EF4444' : 'none'} color={isSaved ? '#EF4444' : '#94A3B8'} />
                      </button>
                    </div>

                    <div className="supplier-meta-row">
                      <span className="supplier-location">
                        <MapPin size={13} /> {sup.city}
                      </span>
                      <span className="supplier-rating">
                        <Star size={13} fill="#F59E0B" color="#F59E0B" /> {sup.rating} ({sup.reviewsCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="supplier-badges-row">
                  {sup.verified && (
                    <span className="badge badge-success">
                      <ShieldCheck size={12} /> Verified Seller
                    </span>
                  )}
                  {sup.gstVerified && (
                    <span className="badge badge-primary">
                      <CheckCircle2 size={12} /> GST Validated
                    </span>
                  )}
                  <span className="badge badge-neutral">
                    {sup.yearsInBusiness}+ Years in Business
                  </span>
                </div>

                <p className="supplier-description">{sup.description}</p>

                {/* Primary Products */}
                <div className="supplier-products-section">
                  <span className="supplier-products-title">Popular Offerings:</span>
                  <div className="supplier-tags-list">
                    {sup.primaryProducts.map((p, idx) => (
                      <span key={idx} className="supplier-product-tag">{p}</span>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="supplier-metrics-bar">
                  <div className="supplier-metric">
                    <Package size={14} />
                    <span>Min Order: <strong>{sup.moq}</strong></span>
                  </div>
                  <div className="supplier-metric">
                    <Clock size={14} />
                    <span>Avg Response: <strong>{sup.responseTime}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="supplier-card-actions">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={() => setContactModalSupplier(sup)}
                  >
                    <MessageSquare size={14} /> Request Quote / Inquire
                  </button>
                  <Link to="/consumer/messages" className="btn btn-secondary btn-sm">
                    Chat
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Inquiry Modal */}
        {contactModalSupplier && (
          <div className="modal-backdrop animate-fade-in" onClick={() => setContactModalSupplier(null)}>
            <div className="modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Inquire with {contactModalSupplier.name}</h2>
              <p className="modal-subtitle">Direct communication through TradeLink verified messaging network.</p>

              {inquirySuccess ? (
                <div className="inquiry-success-alert animate-scale-in">
                  <CheckCircle2 size={36} color="#10B981" />
                  <h4>Inquiry Sent Successfully!</h4>
                  <p>The supplier has been notified via WhatsApp & Email. They will respond shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSendInquiry} className="modal-form">
                  <div className="form-group">
                    <label className="form-label">Select Product of Interest</label>
                    <select className="form-select">
                      {contactModalSupplier.primaryProducts.map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Quantity Needed</label>
                    <input type="text" className="form-input" placeholder="e.g. 200 Pieces, 500 Meters" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message / Delivery Query</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Ask for best price quotes, sample availability, or freight to your warehouse..."
                      required
                    ></textarea>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => setContactModalSupplier(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Send Direct Inquiry</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
