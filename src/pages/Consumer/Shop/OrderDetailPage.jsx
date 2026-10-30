/* ============================================================
   TradeLink — Consumer OrderDetailPage (/consumer/orders/:id)
   Order tracking, timeline, line items table, delivery address,
   and downloadable mock B2B tax invoice.
   ============================================================ */
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, Truck, MapPin, CheckCircle2,
  Clock, XCircle, RotateCcw, AlertTriangle
} from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import ConfirmDialog from '../../../components/inventory/ConfirmDialog';
import { useQuery } from '../../../hooks';
import { shopService } from '../../../services/shopService';
import { shopQueryKeys } from '../../../features/shop/shopQueryKeys';
import './shop-pages.css';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const {
    data: order,
    isLoading,
    refetch,
  } = useQuery(shopQueryKeys.order(id), () => shopService.getConsumerOrderById(id));

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await shopService.cancelOrder(id, cancelReason || 'Buyer requested cancellation');
      setActionLoading(false);
      setCancelModalOpen(false);
      refetch();
    } catch (err) {
      setActionLoading(false);
      alert('Cancellation failed: ' + err.message);
    }
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    const invoiceData = `
============================================================
              TRADELINK B2B TAX INVOICE
============================================================
Invoice Ref: INV-${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Order Status: ${order.status.toUpperCase()}
Supplier ID: ${order.sellerId}
Buyer ID: ${order.consumerId}

DELIVERY DESTINATION:
${order.address?.name}
${order.address?.street}
${order.address?.city}, ${order.address?.state} - ${order.address?.pincode}
Phone: ${order.address?.phone}

LINE ITEMS:
${order.lines?.map((l, idx) => `${idx + 1}. ${l.title} (SKU: ${l.sku})
   Qty: ${l.qty} | Unit: ₹${l.unitPrice} | GST: ${l.gstRate}% (₹${l.gstAmount}) | Line Total: ₹${l.total}`).join('\n')}

------------------------------------------------------------
Product Subtotal:     ₹${order.totals?.subtotal}
Total Applicable GST: ₹${order.totals?.gstAmount}
GRAND TOTAL PAYABLE:  ₹${order.totals?.grandTotal || order.totals?.total}
------------------------------------------------------------
Payment Mode: ${order.paymentMethod === 'net_30' ? 'TradeLink Net-30 Credit' : 'Cash on Delivery (COD)'}
Freight Mode: ${order.deliveryOption === 'express_cargo' ? 'Priority Express Air Cargo' : 'Commercial Road Transport'}
============================================================
Generated via TradeLink B2B Digital Escrow
`;
    const blob = new Blob([invoiceData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <DashboardShell role="consumer">
        <div className="shop-page-container p-8">
          <p className="text-muted">Loading purchase order details...</p>
        </div>
      </DashboardShell>
    );
  }

  if (!order) {
    return (
      <DashboardShell role="consumer">
        <div className="shop-page-container text-center p-12">
          <h2 className="font-bold text-lg mb-2">Order Not Found</h2>
          <Link to="/consumer/orders" className="btn btn-secondary btn-sm">
            Back to Orders
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const lines = order.lines || [];
  const totals = order.totals || {};
  const isPlaced = order.status === 'placed';

  return (
    <DashboardShell role="consumer">
      <div className="shop-page-container animate-fade-in-up">
        <div className="mb-4">
          <Link to="/consumer/orders" className="text-sm text-muted inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft size={14} />
            <span>Back to My Orders</span>
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
            <p>Generated on {new Date(order.createdAt).toLocaleString()} | Supplier: {order.sellerId}</p>
          </div>

          <div className="inv-header-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadInvoice}
            >
              <Download size={14} />
              <span>Download Tax Invoice</span>
            </button>
            {isPlaced && (
              <button
                type="button"
                className="btn btn-secondary btn-sm text-danger"
                onClick={() => setCancelModalOpen(true)}
              >
                <XCircle size={14} />
                <span>Cancel Order</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column: Lines + Timeline & Shipping Destination */}
        <div className="inv-grid-2col">
          {/* Order Lines */}
          <div className="inv-section-card">
            <div className="inv-section-header">
              <h3>Fulfillment Line Items ({lines.length})</h3>
            </div>
            <div className="table-responsive-container">
              <table className="custom-table" aria-label="Purchase order lines">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: 52 }}></th>
                    <th scope="col">Product Specification</th>
                    <th scope="col" className="text-right">Unit Price</th>
                    <th scope="col" className="text-right">Qty</th>
                    <th scope="col" className="text-right">GST</th>
                    <th scope="col" className="text-right">Line Total</th>
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
                          <div className="text-xs text-muted font-mono">SKU: {line.sku || line.productId}</div>
                        </td>
                        <td className="text-right">₹{Number(line.unitPrice).toLocaleString('en-IN')}</td>
                        <td className="text-right font-bold">{line.qty}</td>
                        <td className="text-right text-muted">₹{Number(line.gstAmount || 0).toLocaleString('en-IN')}</td>
                        <td className="text-right font-bold">₹{Number(line.total).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 mt-4 rounded-b-lg">
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted">Subtotal:</span>
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

          {/* Timeline & Shipping Coordinates */}
          <div className="flex flex-col gap-4">
            {/* Delivery Destination */}
            <div className="inv-section-card">
              <div className="inv-section-header">
                <h3>Delivery Consignee Coordinates</h3>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-primary mt-1 flex-shrink-0" />
                <div className="text-sm leading-relaxed">
                  <div className="font-bold">{order.address?.name}</div>
                  <div>{order.address?.street}</div>
                  <div>{order.address?.city}, {order.address?.state} — {order.address?.pincode}</div>
                  <div className="text-muted text-xs mt-1">Contact: {order.address?.phone}</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="inv-section-card">
              <div className="inv-section-header">
                <h3>Dispatch & Delivery Timeline</h3>
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

        {/* Cancellation Dialog */}
        <ConfirmDialog
          isOpen={cancelModalOpen}
          title="Cancel Purchase Order"
          message={`Are you sure you want to cancel Order #${order.id}? All reserved stock will be immediately released.`}
          confirmLabel="Yes, Cancel Order"
          isDestructive={true}
          isLoading={actionLoading}
          onConfirm={handleCancel}
          onCancel={() => setCancelModalOpen(false)}
        >
          <div className="form-group mt-2">
            <label className="form-label" htmlFor="cust-cancel-reason">Cancellation Reason</label>
            <input
              id="cust-cancel-reason"
              type="text"
              className="form-input"
              placeholder="e.g. Project timeline changed..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
        </ConfirmDialog>
      </div>
    </DashboardShell>
  );
}

