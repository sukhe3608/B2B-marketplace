/* ============================================================
   TradeLink — InventoryOrderDetailPage (/seller/inventory/orders/:id)
   Order detail, line items, address, timeline, and actions:
   Confirm, Ship (deducts stock), Reject (releases reservation), Deliver.
   ============================================================ */
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Truck, XCircle, Clock,
  Package, MapPin, AlertTriangle, ShieldCheck
} from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import VerificationBanner from '../../../components/inventory/VerificationBanner';
import ConfirmDialog from '../../../components/inventory/ConfirmDialog';
import { useAuth, useQuery } from '../../../hooks';
import { inventoryService } from '../../../services/inventoryService';
import { inventoryQueryKeys } from '../../../features/inventory/inventoryQueryKeys';
import { mockDb } from '../../../services/mockDb';
import './inventory-pages.css';

export default function InventoryOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, verificationStatus } = useAuth();
  const sellerId = user?.sellerId || 'sel-001';
  const currentSeller = mockDb.findOne('sellers', (s) => s.id === sellerId);
  const effectiveStatus = (verificationStatus && verificationStatus !== 'none')
    ? verificationStatus
    : (currentSeller?.verificationStatus || 'approved');
  const canWrite = effectiveStatus === 'verified' || effectiveStatus === 'approved';

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const {
    data: order,
    isLoading,
    refetch,
  } = useQuery(inventoryQueryKeys.order(id), () => inventoryService.getSellerOrderById(id));

  const handleConfirm = async () => {
    if (!canWrite) return;
    setActionLoading(true);
    try {
      await inventoryService.confirmOrder(id);
      setActionLoading(false);
      refetch();
    } catch (err) {
      setActionLoading(false);
      alert('Failed to confirm order: ' + err.message);
    }
  };

  const handleShip = async () => {
    if (!canWrite) return;
    setActionLoading(true);
    try {
      await inventoryService.shipOrder(id);
      setActionLoading(false);
      refetch();
    } catch (err) {
      setActionLoading(false);
      alert('Failed to ship order: ' + err.message);
    }
  };

  const handleDeliver = async () => {
    if (!canWrite) return;
    setActionLoading(true);
    try {
      await inventoryService.deliverOrder(id);
      setActionLoading(false);
      refetch();
    } catch (err) {
      setActionLoading(false);
      alert('Failed to mark delivered: ' + err.message);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }
    setActionLoading(true);
    try {
      await inventoryService.rejectOrder(id, rejectReason.trim());
      setActionLoading(false);
      setRejectModalOpen(false);
      refetch();
    } catch (err) {
      setActionLoading(false);
      alert('Failed to reject order: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell role="seller">
        <div className="inv-page-container p-8">
          <p className="text-muted">Loading purchase order #{id}...</p>
        </div>
      </DashboardShell>
    );
  }

  if (!order) {
    return (
      <DashboardShell role="seller">
        <div className="inv-page-container text-center p-8">
          <h2 className="font-bold text-lg mb-2">Order Not Found</h2>
          <Link to="/seller/inventory/orders" className="btn btn-secondary btn-sm">
            Back to Orders
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const lines = order.lines || [];
  const totals = order.totals || {};

  return (
    <DashboardShell role="seller">
      <div className="inv-page-container animate-fade-in-up">
        <VerificationBanner verificationStatus={effectiveStatus} />

        <div className="mb-4">
          <Link to="/seller/inventory/orders" className="text-sm text-muted inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft size={14} />
            <span>Back to Orders List</span>
          </Link>
        </div>

        {/* Order Header */}
        <div className="inv-page-header">
          <div className="inv-header-title">
            <div className="flex items-center gap-3">
              <h1>Order #{order.id}</h1>
              <span className={`status-chip ${
                order.status === 'delivered' ? 'chip-green' :
                order.status === 'shipped' ? 'chip-purple' :
                order.status === 'confirmed' ? 'chip-blue' :
                order.status === 'placed' ? 'chip-amber' : 'chip-red'
              }`}>
                {order.status}
              </span>
            </div>
            <p>Placed on {new Date(order.createdAt).toLocaleString()} | Consumer ID: {order.consumerId}</p>
          </div>

          {/* Action Buttons based on status */}
          <div className="inv-header-actions">
            {order.status === 'placed' && (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={!canWrite || actionLoading}
                  onClick={handleConfirm}
                  title={!canWrite ? 'Available after verification' : undefined}
                >
                  <CheckCircle2 size={14} />
                  <span>Confirm Order</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm text-danger"
                  disabled={!canWrite || actionLoading}
                  onClick={() => setRejectModalOpen(true)}
                  title={!canWrite ? 'Available after verification' : undefined}
                >
                  <XCircle size={14} />
                  <span>Reject Order</span>
                </button>
              </>
            )}

            {order.status === 'confirmed' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!canWrite || actionLoading}
                onClick={handleShip}
                title={!canWrite ? 'Available after verification' : 'Deducts physical on-hand stock and logs out movement'}
              >
                <Truck size={14} />
                <span>Ship Order (Deduct Stock)</span>
              </button>
            )}

            {order.status === 'shipped' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!canWrite || actionLoading}
                onClick={handleDeliver}
              >
                <CheckCircle2 size={14} />
                <span>Mark as Delivered</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column: Lines Table + Timeline & Delivery Address */}
        <div className="inv-grid-2col">
          {/* Order Items Table */}
          <div className="inv-section-card">
            <div className="inv-section-header">
              <h3>Ordered Products ({lines.length})</h3>
            </div>
            <div className="table-responsive-container">
              <table className="custom-table" aria-label="Order line items">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: 52 }}></th>
                    <th scope="col">Product Item</th>
                    <th scope="col" className="text-right">Unit Price</th>
                    <th scope="col" className="text-right">Qty</th>
                    <th scope="col" className="text-right">GST</th>
                    <th scope="col" className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => {
                    const thumbSrc = line.image || line.images?.[0];
                    return (
                      <tr key={idx}>
                        <td>
                          {thumbSrc ? (
                            <img
                              src={thumbSrc}
                              alt={line.title}
                              style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid #E2E8F0', display: 'block' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div style={{ width: 44, height: 44, borderRadius: 6, backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: 18, color: '#94A3B8' }}>📦</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="font-semibold">{line.title}</div>
                          <div className="text-xs text-muted">SKU: {line.sku || line.productId}</div>
                        </td>
                        <td className="text-right">₹{Number(line.unitPrice).toLocaleString('en-IN')}</td>
                        <td className="text-right font-bold">{line.qty}</td>
                        <td className="text-right text-muted">₹{Number(line.gstAmount || 0).toLocaleString('en-IN')} ({line.gstRate}%)</td>
                        <td className="text-right font-bold">₹{Number(line.total || (line.unitPrice * line.qty)).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 mt-4 rounded-b-lg">
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted">Items Subtotal:</span>
                <span className="font-medium">₹{Number(totals.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted">Total Applicable GST:</span>
                <span className="font-medium">₹{Number(totals.gstAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-bold py-2 border-t mt-1">
                <span>Grand Total:</span>
                <span className="text-primary font-bold">₹{Number(totals.grandTotal || totals.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Timeline & Shipping Address */}
          <div className="flex flex-col gap-4">
            {/* Shipping Destination */}
            <div className="inv-section-card">
              <div className="inv-section-header">
                <h3>Delivery Address</h3>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-primary mt-1 flex-shrink-0" />
                <div className="text-sm leading-relaxed">
                  <div className="font-bold">{order.address?.name || 'Customer'}</div>
                  <div>{order.address?.street}</div>
                  <div>{order.address?.city}, {order.address?.state} — {order.address?.pincode}</div>
                  <div className="text-muted text-xs mt-1">Contact: {order.address?.phone || 'Provided at checkout'}</div>
                </div>
              </div>
            </div>

            {/* Fulfillment Audit Timeline */}
            <div className="inv-section-card">
              <div className="inv-section-header">
                <h3>Fulfillment Timeline</h3>
              </div>
              <div className="timeline-container">
                {order.timeline?.map((event, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-status capitalize">{event.status}</div>
                    <div className="timeline-date">{new Date(event.timestamp).toLocaleString()}</div>
                    {event.note && <div className="timeline-note">{event.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reject Modal Dialog */}
        <ConfirmDialog
          isOpen={rejectModalOpen}
          title="Reject Purchase Order"
          confirmLabel="Reject & Release Stock"
          isDestructive={true}
          isLoading={actionLoading}
          onConfirm={handleReject}
          onCancel={() => setRejectModalOpen(false)}
        >
          <div className="form-group mt-2">
            <label className="form-label" htmlFor="reject-reason">
              Reason for Order Rejection (Required) *
            </label>
            <textarea
              id="reject-reason"
              rows="3"
              className="form-textarea"
              placeholder="e.g. Inability to fulfill requested MOQ delivery within lead time, damaged transit stock..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <p className="text-xs text-muted mt-2">
              Rejecting this order will release all currently reserved stock units back into available customer inventory.
            </p>
          </div>
        </ConfirmDialog>
      </div>
    </DashboardShell>
  );
}

