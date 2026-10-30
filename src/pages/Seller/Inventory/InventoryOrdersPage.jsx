/* ============================================================
   TradeLink — InventoryOrdersPage (/seller/inventory/orders)
   Incoming buyer purchase orders with status filtering tabs and links.
   ============================================================ */
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Eye, Clock, CheckCircle2, Truck, XCircle, Package } from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import VerificationBanner from '../../../components/inventory/VerificationBanner';
import { useAuth, useQuery } from '../../../hooks';
import { inventoryService } from '../../../services/inventoryService';
import { inventoryQueryKeys } from '../../../features/inventory/inventoryQueryKeys';
import { mockDb } from '../../../services/mockDb';
import './inventory-pages.css';

const TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'placed', label: 'Placed (New)' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function InventoryOrdersPage() {
  const { user, verificationStatus } = useAuth();
  const sellerId = user?.sellerId || 'sel-001';
  const currentSeller = mockDb.findOne('sellers', (s) => s.id === sellerId);
  const effectiveStatus = (verificationStatus && verificationStatus !== 'none')
    ? verificationStatus
    : (currentSeller?.verificationStatus || 'approved');

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('status') || 'all';

  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery(
    inventoryQueryKeys.orders(sellerId, activeTab),
    () => inventoryService.getSellerOrders(sellerId, activeTab)
  );

  const handleTabChange = (tabId) => {
    const next = new URLSearchParams(searchParams);
    if (tabId === 'all') next.delete('status');
    else next.set('status', tabId);
    setSearchParams(next);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'placed':
        return <span className="status-chip chip-amber"><Clock size={12} /> Placed</span>;
      case 'confirmed':
        return <span className="status-chip chip-blue"><CheckCircle2 size={12} /> Confirmed</span>;
      case 'shipped':
        return <span className="status-chip chip-purple"><Truck size={12} /> Shipped</span>;
      case 'delivered':
        return <span className="status-chip chip-green"><CheckCircle2 size={12} /> Delivered</span>;
      case 'cancelled':
        return <span className="status-chip chip-red"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="status-chip chip-gray">{status}</span>;
    }
  };

  return (
    <DashboardShell role="seller">
      <div className="inv-page-container animate-fade-in-up">
        <VerificationBanner verificationStatus={effectiveStatus} />

        <div className="inv-page-header">
          <div className="inv-header-title">
            <h1>Incoming Customer Orders</h1>
            <p>Manage fulfillment, stock deductions, shipping, and order dispatching.</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="order-status-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`order-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <p className="p-8 text-center text-muted">Loading purchase orders...</p>
        ) : orders.length === 0 ? (
          <div className="empty-state-card text-center p-8">
            <Package size={40} className="mx-auto text-muted mb-2" />
            <h3 className="font-bold text-lg mb-1">No orders found</h3>
            <p className="text-muted text-sm">
              There are currently no orders in status "{activeTab}".
            </p>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className="custom-table" aria-label="Incoming seller orders table">
              <thead>
                <tr>
                  <th scope="col">Order ID</th>
                  <th scope="col">Date</th>
                  <th scope="col">Buyer Destination</th>
                  <th scope="col">Order Lines</th>
                  <th scope="col" className="text-right">Total Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const lineSummary = order.lines?.map((l) => `${l.title} (x${l.qty})`).join(', ') || 'Items';
                  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—';
                  const total = order.totals?.grandTotal || order.totals?.total || 0;

                  return (
                    <tr key={order.id}>
                      <td className="font-mono font-bold text-primary">#{order.id}</td>
                      <td className="text-muted text-xs">{dateStr}</td>
                      <td>
                        <div className="font-medium">{order.address?.city || 'India'}</div>
                        <div className="text-xs text-muted">{order.address?.pincode}</div>
                      </td>
                      <td>
                        {/* Thumbnails for first 3 lines */}
                        <div className="flex items-center gap-1 mb-1">
                          {order.lines?.slice(0, 3).map((l, i) => {
                            const t = l.image || l.images?.[0];
                            return t ? (
                              <img key={i} src={t} alt={l.title}
                                style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4, border: '1px solid #E2E8F0', flexShrink: 0 }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : null;
                          })}
                        </div>
                        <div className="text-xs max-w-xs truncate" title={lineSummary}>
                          {lineSummary}
                        </div>
                        <span className="text-xs text-muted">({order.lines?.length || 0} line items)</span>
                      </td>
                      <td className="text-right font-bold">
                        ₹{Number(total).toLocaleString('en-IN')}
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td className="text-right">
                        <Link
                          to={`/seller/inventory/orders/${order.id}`}
                          className="btn btn-secondary btn-xs inline-flex items-center gap-1"
                        >
                          <Eye size={13} />
                          <span>Process</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

