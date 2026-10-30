/* ============================================================
   TradeLink — InventoryRFQsPage (/seller/inventory/rfqs)
   Manage incoming custom quote requests (RFQs) and send quoted pricing.
   ============================================================ */
import { useState } from 'react';
import { FileText, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import VerificationBanner from '../../../components/inventory/VerificationBanner';
import { useAuth, useQuery } from '../../../hooks';
import { inventoryService } from '../../../services/inventoryService';
import { inventoryQueryKeys } from '../../../features/inventory/inventoryQueryKeys';
import { mockDb } from '../../../services/mockDb';
import './inventory-pages.css';

export default function InventoryRFQsPage() {
  const { user, verificationStatus } = useAuth();
  const sellerId = user?.sellerId || 'sel-001';
  const currentSeller = mockDb.findOne('sellers', (s) => s.id === sellerId);
  const effectiveStatus = (verificationStatus && verificationStatus !== 'none')
    ? verificationStatus
    : (currentSeller?.verificationStatus || 'approved');
  const canWrite = effectiveStatus === 'verified' || effectiveStatus === 'approved';

  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyPrice, setReplyPrice] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: rfqs = [],
    isLoading,
    refetch,
  } = useQuery(inventoryQueryKeys.rfqs(sellerId), () => inventoryService.getSellerRFQs(sellerId));

  const handleSendReply = async (rfqId) => {
    const price = parseFloat(replyPrice);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid quoted unit price.');
      return;
    }
    setIsSubmitting(true);
    try {
      await inventoryService.replyRFQ(rfqId, {
        quotedPrice: price,
        quotedMessage: replyMessage.trim() || 'Quotation submitted for requested volume.',
      });
      setIsSubmitting(false);
      setActiveReplyId(null);
      setReplyPrice('');
      setReplyMessage('');
      refetch();
    } catch (err) {
      setIsSubmitting(false);
      alert('Failed to submit quote: ' + err.message);
    }
  };

  return (
    <DashboardShell role="seller">
      <div className="inv-page-container animate-fade-in-up">
        <VerificationBanner verificationStatus={effectiveStatus} />

        <div className="inv-page-header">
          <div className="inv-header-title">
            <h1>Customer Quote Requests (RFQs)</h1>
            <p>Direct volume negotiation inquiries from buyers for custom and made-to-order goods.</p>
          </div>
        </div>

        {isLoading ? (
          <p className="p-8 text-center text-muted">Loading quote requests...</p>
        ) : rfqs.length === 0 ? (
          <div className="empty-state-card text-center p-8">
            <MessageSquare size={36} className="mx-auto text-muted mb-2" />
            <h3 className="font-bold text-lg mb-1">No RFQs yet</h3>
            <p className="text-muted text-sm">When buyers request custom quotes on your products, they will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {rfqs.map((rfq) => {
              const isReplying = activeReplyId === rfq.id;
              const isQuoted = rfq.status === 'quoted';

              return (
                <div key={rfq.id} className="inv-section-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b">
                    <div className="flex items-center gap-3">
                      {/* Product thumbnail */}
                      {rfq.product?.images?.[0] && (
                        <img
                          src={rfq.product.images[0]}
                          alt={rfq.productTitle}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #E2E8F0', flexShrink: 0 }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted">#{rfq.id}</span>
                          <h3 className="font-bold text-base">{rfq.productTitle || `Product ${rfq.productId}`}</h3>
                        </div>
                        <span className="text-xs text-muted">Buyer: {rfq.consumerName || rfq.consumerId} | Requested Qty: <strong className="text-primary">{rfq.qty} units</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`status-chip ${
                        rfq.status === 'quoted' ? 'chip-green' :
                        rfq.status === 'open' ? 'chip-amber' : 'chip-gray'
                      }`}>
                        {rfq.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md mb-3 border border-slate-100">
                    "{rfq.message || 'No additional message provided.'}"
                  </p>

                  {/* Quoted Information if already quoted */}
                  {isQuoted && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md mb-3 text-sm flex items-center justify-between">
                      <div>
                        <span className="text-emerald-800 font-semibold block">Your Active Quotation:</span>
                        <span className="text-emerald-950 font-bold text-lg">₹{Number(rfq.quotedPrice).toLocaleString('en-IN')} / unit</span>
                        {rfq.quotedMessage && <p className="text-xs text-emerald-700 mt-1">"{rfq.quotedMessage}"</p>}
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs"
                        disabled={!canWrite}
                        onClick={() => {
                          setActiveReplyId(isReplying ? null : rfq.id);
                          setReplyPrice(String(rfq.quotedPrice || ''));
                        }}
                      >
                        Update Quote
                      </button>
                    </div>
                  )}

                  {/* Reply Button or Form */}
                  {!isReplying && !isQuoted && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={!canWrite}
                      onClick={() => {
                        setActiveReplyId(rfq.id);
                        setReplyPrice('');
                        setReplyMessage('');
                      }}
                      title={!canWrite ? 'Available after verification' : undefined}
                    >
                      <Send size={14} />
                      <span>Respond with Quote</span>
                    </button>
                  )}

                  {/* Reply Form */}
                  {isReplying && (
                    <div className="mt-3 p-4 border border-indigo-200 bg-indigo-50/50 rounded-lg">
                      <h4 className="font-bold text-sm text-indigo-900 mb-2">Submit Official Quote</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="form-label" htmlFor={`price-${rfq.id}`}>Quoted Price per Unit (₹) *</label>
                          <input
                            id={`price-${rfq.id}`}
                            type="number"
                            min="1"
                            step="any"
                            required
                            className="form-input"
                            placeholder="e.g. 850"
                            value={replyPrice}
                            onChange={(e) => setReplyPrice(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="form-label" htmlFor={`msg-${rfq.id}`}>Note / Terms for Buyer</label>
                          <input
                            id={`msg-${rfq.id}`}
                            type="text"
                            className="form-input"
                            placeholder="e.g. Price valid for 14 days; includes standard palletization."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setActiveReplyId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={isSubmitting || !canWrite}
                          onClick={() => handleSendReply(rfq.id)}
                        >
                          <Send size={14} />
                          <span>{isSubmitting ? 'Sending...' : 'Send Quote to Buyer'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

