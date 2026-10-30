/* ============================================================
   TradeLink — Consumer OrdersPage (/consumer/orders)
   Purchase orders list with status filtering, reorder action,
   and cancellation (with reservation release).
   ============================================================ */
import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Package, Clock, CheckCircle2, Truck, XCircle, RotateCcw,
  Eye, AlertTriangle, ArrowRight
} from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import ConfirmDialog from '../../../components/inventory/ConfirmDialog';
import { useAuth, useQuery } from '../../../hooks';
import { shopService } from '../../../services/shopService';
import { shopQueryKeys } from '../../../features/shop/shopQueryKeys';
import { addLine } from '../../../store/cartSlice';
import './shop-pages.css';

const STATUS_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'placed', label: 'Placed' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const consumerId = (user?.email === 'consumer@demo.com' || !user?.id) ? 'consumer-demo' : user.id;

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('status') || 'all';

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery(
    shopQueryKeys.orders(consumerId, activeTab),
    () => shopService.getConsumerOrders(consumerId, activeTab)
  );

  const handleTabChange = (tabId) => {
    const next = new URLSearchParams(searchParams);
    if (tabId === 'all') next.delete('status');
    else next.set('status', tabId);
    setSearchParams(next);
  };

  const handleReorder = (order) => {
    order.lines?.forEach((line) => {
      dispatch(
        addLine({
          productId: line.productId,
          sellerId: order.sellerId,
          sellerName: 'TradeLink Supplier',
          title: line.title,
          sku: line.sku,
          qty: line.qty,
          unitPrice: line.unitPrice,
          gstRate: line.gstRate || 18,
          moq: 1,
        })
      );
    });
    navigate('/consumer/cart');
  };

  const handleCancelOrder = async () => {
    if (!cancelTarget) return;
    setActionLoading(true);
    try {
      await shopService.cancelOrder(cancelTarget.id, cancelReason || 'Buyer requested cancellation');
      setActionLoading(false);
      setCancelTarget(null);
      setCancelReason('');
      refetch();
    } catch (err) {
      setActionLoading(false);
      alert('Cancellation failed: ' + err.message);
    }
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
    <DashboardShell role="consumer">
      <div className="shop-page-container animate-fade-in-up">
        <div className="inv-page-header">
          <div className="inv-header-title">
            <h1>My Wholesale Orders</h1>
            <p>Track purchase order fulfillment status, reorder items, and access commercial invoices.</p>
          </div>
        </div>

        {/* Status Filtering Tabs */}
        <div className="order-status-tabs">
          {STATUS_TABS.map((tab) => (
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

        {isLoading ? (
          <p className="p-8 text-center text-muted">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="empty-state-card text-center p-12">
            <Package size={44} className="mx-auto text-muted mb-3" />
            <h3 className="font-bold text-lg mb-1">No orders in "{activeTab}" status</h3>
            <p className="text-muted text-sm mb-4">You have no wholesale orders matching this status tab.</p>
            <Link to="/consumer/shop" className="btn btn-primary btn-sm">
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const isPlaced = order.status === 'placed';
              const lineCount = order.lines?.length || 0;
              const grandTotal = order.totals?.grandTotal || order.totals?.total || 0;
              const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—';

              return (
                <div key={order.id} className="inv-section-card">
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-base text-primary">#{order.id}</span>
                      {getStatusBadge(order.status)}
                      <span className="text-xs text-muted">Ordered on {dateStr}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-muted block">Order Total (inc. GST)</span>
                      <span className="font-bold text-lg text-slate-900">₹{Number(grandTotal).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Lines list */}
                  <div className="space-y-2 mb-4">
                    {order.lines?.map((line, idx) => {
                      const thumbSrc = line.image || line.images?.[0];
                      return (
                        <div key={idx} className="flex justify-between items-center text-sm gap-2">
                          <div className="flex items-center gap-2">
                            {thumbSrc && (
                              <img
                                src={thumbSrc}
                                alt={line.title}
                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid #E2E8F0' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <span className="font-medium">{line.title}</span>
                            <span className="text-xs text-muted font-mono">(SKU: {line.sku || line.productId})</span>
                          </div>
                          <span className="font-semibold flex-shrink-0">
                            {line.qty} units × ₹{Number(line.unitPrice).toLocaleString('en-IN')}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between pt-3 border-t gap-2">
                    <Link
                      to={`/consumer/orders/${order.id}`}
                      className="btn btn-secondary btn-xs inline-flex items-center gap-1"
                    >
                      <Eye size={13} />
                      <span>View Invoice & Timeline</span>
                    </Link>

                    <div className="flex gap-2">
                      {isPlaced && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs text-danger"
                          onClick={() => setCancelTarget(order)}
                        >
                          <XCircle size={13} />
                          <span>Cancel Order</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-primary btn-xs inline-flex items-center gap-1"
                        onClick={() => handleReorder(order)}
                      >
                        <RotateCcw size={13} />
                        <span>Reorder Items</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!cancelTarget}
          title="Cancel Purchase Order"
          message={`Are you sure you want to cancel Order #${cancelTarget?.id}? All reserved stock units will be released back to the supplier.`}
          confirmLabel="Confirm Cancellation"
          isDestructive={true}
          isLoading={actionLoading}
          onConfirm={handleCancelOrder}
          onCancel={() => setCancelTarget(null)}
        >
          <div className="form-group mt-2">
            <label className="form-label" htmlFor="cancel-reason">Cancellation Reason (Optional)</label>
            <input
              id="cancel-reason"
              type="text"
              className="form-input"
              placeholder="e.g. Schedule changed, duplicated order..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
        </ConfirmDialog>
      </div>
    </DashboardShell>
  );
}

