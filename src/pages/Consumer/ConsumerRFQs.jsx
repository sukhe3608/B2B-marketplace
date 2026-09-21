/* ============================================================
   TradeLink — Consumer RFQs Management Page
   Post RFQ, track supplier quotes, and filter by status.
   ============================================================ */
import { useState } from 'react';
import {
  FileText, Plus, Search, Filter, Calendar, DollarSign,
  Package, ChevronRight, CheckCircle2, Clock, X, MessageSquare, ExternalLink
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import { CATEGORIES, MOCK_RFQS, RFQ_STATUSES } from '../../utils/constants';
import './ConsumerPages.css';

export default function ConsumerRFQs() {
  const [rfqs, setRfqs] = useState(MOCK_RFQS);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New RFQ Form State
  const [formData, setFormData] = useState({
    product: '',
    category: CATEGORIES[0].label,
    quantity: '',
    budget: '',
    description: '',
  });

  const filteredRfqs = rfqs.filter((rfq) => {
    const matchesTab = activeTab === 'all' || rfq.status === activeTab;
    const matchesSearch =
      rfq.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateRFQ = (e) => {
    e.preventDefault();
    if (!formData.product || !formData.quantity) return;

    const newRfq = {
      id: `rfq-${Date.now().toString().slice(-4)}`,
      product: formData.product,
      category: formData.category,
      quantity: formData.quantity,
      budget: formData.budget || 'Open for quotes',
      status: 'open',
      createdAt: 'Just now',
      quotesReceived: 0,
      buyer: 'You',
    };

    setRfqs([newRfq, ...rfqs]);
    setFormData({ product: '', category: CATEGORIES[0].label, quantity: '', budget: '', description: '' });
    setModalOpen(false);
  };

  return (
    <DashboardShell role="consumer">
      <div className="subpage-container animate-fade-in-up">
        {/* Top Header */}
        <div className="subpage-header">
          <div>
            <h1 className="subpage-title">My Requirements & RFQs</h1>
            <p className="subpage-subtitle">Track quotes received from verified manufacturers and post new requirements.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={18} /> Post New Requirement
          </button>
        </div>

        {/* Filter Bar */}
        <div className="subpage-filter-bar">
          <div className="filter-search-box">
            <Search size={18} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search by product or category..."
              className="filter-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="subpage-tabs">
            {['all', 'open', 'quoted', 'closed'].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* RFQ List */}
        <div className="rfq-cards-grid">
          {filteredRfqs.length > 0 ? (
            filteredRfqs.map((rfq) => {
              const status = RFQ_STATUSES[rfq.status.toUpperCase()] || RFQ_STATUSES.OPEN;
              return (
                <div key={rfq.id} className="card rfq-manage-card">
                  <div className="rfq-card-top">
                    <div className="rfq-category-pill">{rfq.category}</div>
                    <span className={`badge badge-${status.color}`}>{status.label}</span>
                  </div>

                  <h3 className="rfq-card-title">{rfq.product}</h3>

                  <div className="rfq-card-details">
                    <div className="rfq-detail-row">
                      <Package size={15} />
                      <span>Quantity: <strong>{rfq.quantity}</strong></span>
                    </div>
                    <div className="rfq-detail-row">
                      <DollarSign size={15} />
                      <span>Budget: <strong>{rfq.budget}</strong></span>
                    </div>
                    <div className="rfq-detail-row">
                      <Calendar size={15} />
                      <span>Posted: <strong>{rfq.createdAt}</strong></span>
                    </div>
                  </div>

                  <div className="rfq-card-footer">
                    <div className="rfq-quotes-count">
                      <MessageSquare size={16} />
                      <span><strong>{rfq.quotesReceived}</strong> quotes received</span>
                    </div>
                    <button className="btn btn-secondary btn-sm">
                      View Details <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card empty-state-card">
              <FileText size={44} className="empty-state-icon" />
              <h3>No requirements found</h3>
              <p>Try clearing filters or post a new request for quotation to suppliers.</p>
              <button className="btn btn-primary btn-sm mt-3" onClick={() => setModalOpen(true)}>
                Post Requirement
              </button>
            </div>
          )}
        </div>

        {/* Post RFQ Modal Dialog */}
        {modalOpen && (
          <div className="modal-backdrop animate-fade-in" onClick={() => setModalOpen(false)}>
            <div className="modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Post a Requirement (RFQ)</h2>
                  <p className="modal-subtitle">Tell verified suppliers what you need and receive instant quotes.</p>
                </div>
                <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateRFQ} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Product / Service Needed *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mild Steel Flanges 50mm, 5HP Water Pump"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.label}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quantity Required *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 500 Pieces, 2 Tons"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Budget (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ₹50,000 – ₹1,00,000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Technical Specifications</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Mention materials, grade, delivery location, or special quality requirements..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Requirement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
