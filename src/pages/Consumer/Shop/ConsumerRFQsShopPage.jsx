/* ============================================================
   TradeLink — ConsumerRFQsShopPage (/consumer/rfqs-shop)
   Customer view of custom volume quote inquiries, quoted prices,
   and "Convert Quote to Cart" action.
   ============================================================ */
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FileText, ShoppingCart, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import { useAuth, useQuery } from '../../../hooks';
import { shopService } from '../../../services/shopService';
import { shopQueryKeys } from '../../../features/shop/shopQueryKeys';
import { addLine } from '../../../store/cartSlice';
import './shop-pages.css';

export default function ConsumerRFQsShopPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const consumerId = (user?.email === 'consumer@demo.com' || !user?.id) ? 'consumer-demo' : user.id;

  const {
    data: rfqs = [],
    isLoading,
    refetch,
  } = useQuery(shopQueryKeys.rfqs(consumerId), () => shopService.getConsumerRFQs(consumerId));

  const handleConvertQuoteToCart = (rfq) => {
    dispatch(
      addLine({
        productId: rfq.productId,
        sellerId: rfq.sellerId,
        sellerName: 'TradeLink Supplier',
        title: rfq.productTitle || `Product ${rfq.productId}`,
        qty: Number(rfq.qty) || 1,
        unitPrice: Number(rfq.quotedPrice),
        gstRate: 18,
        moq: 1,
        priceSlabs: [{ minQty: 1, price: Number(rfq.quotedPrice) }],
      })
    );
    navigate('/consumer/cart');
  };

  return (
    <DashboardShell role="consumer">
      <div className="shop-page-container animate-fade-in-up">
        <div className="inv-page-header">
          <div className="inv-header-title">
            <h1>My Custom Quote Requests (RFQs)</h1>
            <p>Direct wholesale price negotiations with manufacturers and suppliers.</p>
          </div>
        </div>

        {isLoading ? (
          <p className="p-8 text-center text-muted">Loading quote inquiries...</p>
        ) : rfqs.length === 0 ? (
          <div className="empty-state-card text-center p-12">
            <MessageSquare size={44} className="mx-auto text-muted mb-3" />
            <h3 className="font-bold text-lg mb-1">No custom quote inquiries</h3>
            <p className="text-muted text-sm mb-4">
              When you submit a volume or made-to-order inquiry from a product page, it will track here.
            </p>
            <Link to="/consumer/shop" className="btn btn-primary btn-sm">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {rfqs.map((rfq) => {
              const isQuoted = rfq.status === 'quoted';
              const isOpen = rfq.status === 'open';

              return (
                <div key={rfq.id} className="inv-section-card">
                  {/* Product image banner */}
                  {rfq.productImage && (
                    <div style={{ margin: '-16px -16px 12px', borderRadius: '8px 8px 0 0', overflow: 'hidden', height: 120 }}>
                      <img
                        src={rfq.productImage}
                        alt={rfq.productTitle}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b gap-2">
                    <div>
                      <span className="font-mono text-xs text-muted">RFQ #{rfq.id}</span>
                      <h3 className="font-bold text-base">{rfq.productTitle || `Product ${rfq.productId}`}</h3>
                      <span className="text-xs text-muted">Requested Quantity: <strong className="text-primary">{rfq.qty} units</strong></span>
                    </div>

                    <span className={`status-chip ${
                      isQuoted ? 'chip-green' : isOpen ? 'chip-amber' : 'chip-gray'
                    }`}>
                      {rfq.status}
                    </span>
                  </div>

                  {rfq.message && (
                    <p className="text-xs text-muted mb-3 italic">
                      Your note: "{rfq.message}"
                    </p>
                  )}

                  {/* Seller Quotation Response */}
                  {isQuoted ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide block">
                          Supplier's Formal Quoted Rate:
                        </span>
                        <div className="text-xl font-bold text-emerald-950 mt-1">
                          ₹{Number(rfq.quotedPrice).toLocaleString('en-IN')} <span className="text-xs text-emerald-700 font-normal">/ unit</span>
                        </div>
                        {rfq.quotedMessage && (
                          <p className="text-xs text-emerald-800 mt-1">
                            Supplier Terms: "{rfq.quotedMessage}"
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm inline-flex items-center gap-1 self-start sm:self-auto"
                        onClick={() => handleConvertQuoteToCart(rfq)}
                      >
                        <ShoppingCart size={14} />
                        <span>Add Quoted Rate to Cart</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                      ⏳ Supplier is currently reviewing your requested specifications and volume. A formal rate quotation will appear here shortly.
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

