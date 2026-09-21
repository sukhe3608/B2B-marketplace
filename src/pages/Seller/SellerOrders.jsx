/* ============================================================
   TradeLink — Seller Orders Management Page
   Fulfillment tracking, invoice downloads, and order status updates.
   ============================================================ */
import { useState } from 'react';
import {
  ShoppingCart, Search, Filter, Download, Eye, CheckCircle2,
  Clock, Truck, PackageCheck, AlertCircle, Building2, Calendar
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import { MOCK_SELLER_ORDERS } from '../../utils/constants';
import './SellerPages.css';

export default function SellerOrders() {
  const [orders, setOrders] = useState(MOCK_SELLER_ORDERS);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((ord) => {
    const matchesTab = activeTab === 'all' || ord.status === activeTab;
    const matchesSearch =
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.productName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning"><Clock size={12} /> Pending Confirmation</span>;
      case 'processing':
        return <span className="badge badge-primary"><Clock size={12} /> In Production</span>;
      case 'dispatched':
        return <span className="badge badge-accent"><Truck size={12} /> Dispatched / In Transit</span>;
      case 'completed':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> Delivered & Completed</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const handleDownloadInvoice = (orderId) => {
    alert(`Generating GST Tax Invoice for Order #${orderId}...`);
  };

  return (
    <DashboardShell role="seller">
      <div className="subpage-container animate-fade-in-up">
        {/* Header */}
        <div className="subpage-header">
          <div>
            <h1 className="subpage-title">B2B Purchase Orders & Fulfillment</h1>
            <p className="subpage-subtitle">Track payments held in TradeLink Escrow, production timelines, and freight status.</p>
          </div>
          <div className="header-stat-pill">
            <ShoppingCart size={16} className="text-primary" />
            <span>Active Orders: <strong>{orders.filter((o) => o.status !== 'completed').length}</strong></span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="subpage-filter-bar">
          <div className="filter-search-box">
            <Search size={18} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search by Order ID, Buyer Company, or Product..."
              className="filter-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="subpage-tabs">
            {['all', 'pending', 'processing', 'dispatched', 'completed'].map((tab) => (
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

        {/* Orders Table */}
        <div className="card table-container-card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order ID & Date</th>
                  <th>Buyer Company</th>
                  <th>Product & Quantity</th>
                  <th>Total Value</th>
                  <th>Order Status</th>
                  <th>Payment Escrow</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <strong className="order-id-link">{ord.id}</strong>
                        <div className="table-meta-sub">
                          <Calendar size={12} /> {ord.orderDate}
                        </div>
                      </td>
                      <td>
                        <div className="table-buyer-name">{ord.buyerName}</div>
                        <span className="table-meta-sub">{ord.buyerCity}</span>
                      </td>
                      <td>
                        <div className="table-product-name">{ord.productName}</div>
                        <span className="table-meta-sub">Qty: {ord.quantity} units @ {ord.unitPrice}</span>
                      </td>
                      <td>
                        <strong className="table-price">{ord.totalAmount}</strong>
                      </td>
                      <td>
                        {getStatusBadge(ord.status)}
                      </td>
                      <td>
                        <span className={`payment-pill ${ord.paymentStatus.includes('Paid') ? 'paid' : ord.paymentStatus.includes('Released') ? 'released' : 'awaiting'}`}>
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions-cell">
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Download Tax Invoice"
                            onClick={() => handleDownloadInvoice(ord.id)}
                          >
                            <Download size={13} /> Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6">
                      No orders matching the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
