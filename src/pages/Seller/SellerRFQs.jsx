/* ============================================================
   TradeLink — Seller Inbound RFQs & Lead Response Page
   Review buyer inquiries, evaluate quantity requirements, and submit quotes.
   ============================================================ */
import { useState } from 'react';
import {
  FileText, Search, Send, Clock, MapPin, DollarSign,
  Package, CheckCircle2, User, X, ChevronRight, MessageSquare
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import { MOCK_RFQS, RFQ_STATUSES } from '../../utils/constants';
import './SellerPages.css';

export default function SellerRFQs() {
  const [rfqs, setRfqs] = useState(MOCK_RFQS);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteModalRfq, setQuoteModalRfq] = useState(null);
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  // Quote Form
  const [quoteData, setQuoteData] = useState({
    pricePerUnit: '',
    deliveryDays: '7',
    taxInclusive: true,
    message: '',
  });

  const filteredRfqs = rfqs.filter((r) => {
    const matchesTab = activeTab === 'all' || r.status === activeTab;
    const matchesSearch =
      r.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleSubmitQuote = (e) => {
    e.preventDefault();
    setQuoteSuccess(true);
    setTimeout(() => {
      setRfqs((prev) =>
        prev.map((r) => (r.id === quoteModalRfq.id ? { ...r, status: 'quoted', quotesReceived: r.quotesReceived + 1 } : r))
      );
      setQuoteSuccess(false);
      setQuoteModalRfq(null);
      setQuoteData({ pricePerUnit: '', deliveryDays: '7', taxInclusive: true, message: '' });
    }, 1800);
  };

  return (
    <DashboardShell role="seller">
      <div className="subpage-container animate-fade-in-up">
        {/* Header */}
        <div className="subpage-header">
          <div>
            <h1 className="subpage-title">Inbound Buyer Inquiries & RFQs</h1>
            <p className="subpage-subtitle">Respond directly to verified enterprise buyers with competitive price quotations.</p>
          </div>
          <div className="header-stat-pill">
            <Clock size={16} className="text-warning" />
            <span>Avg Response Target: <strong>&lt; 2 Hours</strong></span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="subpage-filter-bar">
          <div className="filter-search-box">
            <Search size={18} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search incoming leads by product..."
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

        {/* RFQ Feed Grid */}
        <div className="rfq-cards-grid">
          {filteredRfqs.map((rfq) => {
            const status = RFQ_STATUSES[rfq.status.toUpperCase()] || RFQ_STATUSES.OPEN;
            const isQuotedByMe = rfq.status === 'quoted';

            return (
              <div key={rfq.id} className="card rfq-manage-card">
                <div className="rfq-card-top">
                  <div className="rfq-category-pill">{rfq.category}</div>
                  <span className={`badge badge-${status.color}`}>{status.label}</span>
                </div>

                <h3 className="rfq-card-title">{rfq.product}</h3>

                <div className="rfq-buyer-info-box">
                  <User size={14} />
                  <span>Posted by: <strong>{rfq.buyer}</strong> (Verified Enterprise Buyer)</span>
                </div>

                <div className="rfq-card-details">
                  <div className="rfq-detail-row">
                    <Package size={15} />
                    <span>Requested Qty: <strong>{rfq.quantity}</strong></span>
                  </div>
                  <div className="rfq-detail-row">
                    <DollarSign size={15} />
                    <span>Buyer Target: <strong>{rfq.budget}</strong></span>
                  </div>
                  <div className="rfq-detail-row">
                    <Clock size={15} />
                    <span>Inquiry Date: <strong>{rfq.createdAt}</strong></span>
                  </div>
                </div>

                <div className="rfq-card-footer">
                  <span className="rfq-quotes-count">
                    {rfq.quotesReceived} competing quotes
                  </span>

                  {isQuotedByMe ? (
                    <span className="badge badge-success" style={{ padding: '6px 12px' }}>
                      <CheckCircle2 size={14} /> Quote Sent
                    </span>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setQuoteModalRfq(rfq)}
                    >
                      <Send size={14} /> Submit Quote
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Quotation Modal */}
        {quoteModalRfq && (
          <div className="modal-backdrop animate-fade-in" onClick={() => setQuoteModalRfq(null)}>
            <div className="modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Quote for {quoteModalRfq.product}</h2>
                  <p className="modal-subtitle">Requested by {quoteModalRfq.buyer} · Target: {quoteModalRfq.budget}</p>
                </div>
                <button className="modal-close-btn" onClick={() => setQuoteModalRfq(null)}>
                  <X size={20} />
                </button>
              </div>

              {quoteSuccess ? (
                <div className="inquiry-success-alert animate-scale-in">
                  <CheckCircle2 size={40} color="#10B981" />
                  <h4>Quotation Dispatched!</h4>
                  <p>Your pricing offer has been sent directly to the buyer with verified stamp.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitQuote} className="modal-form">
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Price per Unit (₹) *</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 1850"
                        value={quoteData.pricePerUnit}
                        onChange={(e) => setQuoteData({ ...quoteData, pricePerUnit: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Delivery Timeline (Days) *</label>
                      <input
                        type="number"
                        className="form-input"
                        value={quoteData.deliveryDays}
                        onChange={(e) => setQuoteData({ ...quoteData, deliveryDays: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Proposal Details & Payment Terms</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Mention GST status, warranty, payment milestone terms, or bulk discounts..."
                      value={quoteData.message}
                      onChange={(e) => setQuoteData({ ...quoteData, message: e.target.value })}
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => setQuoteModalRfq(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Submit Official Quotation
                    </button>
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
