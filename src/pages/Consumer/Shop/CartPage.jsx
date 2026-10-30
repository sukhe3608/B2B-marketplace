/* ============================================================
   TradeLink — CartPage (/consumer/cart)
   Cart grouped by supplier, live store re-validation flags,
   per-seller GST breakdown, and Save for Later list.
   ============================================================ */
import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart, ArrowRight, ShieldCheck, AlertTriangle,
  Building, Bookmark, Trash2, RotateCcw
} from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import CartItem from '../../../components/shop/CartItem';
import {
  selectCartLines,
  selectSavedForLater,
  selectCartHasFlags,
  updateQty,
  removeLine,
  saveForLater,
  restoreFromSaved,
  removeFromSaved,
  setLines,
  acknowledgeFlag,
} from '../../../store/cartSlice';
import { revalidateCart, groupCartBySeller, cartTotals } from '../../../logic/cartLogic';
import { mockDb } from '../../../services/mockDb';
import './shop-pages.css';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const lines = useSelector(selectCartLines);
  const savedForLater = useSelector(selectSavedForLater);
  const hasFlags = useSelector(selectCartHasFlags);

  // Revalidate cart lines against live mockDb state on mount or change
  useEffect(() => {
    if (!lines || lines.length === 0) return;

    try {
      const liveProducts = mockDb.get('products') || [];
      const liveStockLevels = mockDb.get('stockLevels') || [];
      const liveSellers = mockDb.get('sellers') || [];

      const { revalidatedLines, hasChanges } = revalidateCart(lines, {
        products: liveProducts,
        stockLevels: liveStockLevels,
        sellers: liveSellers,
      });

      if (hasChanges) {
        dispatch(setLines(revalidatedLines));
      }
    } catch (err) {
      console.error('Cart revalidation error:', err);
    }
  }, [dispatch]);

  // Group lines by seller
  const sellerGroups = useMemo(() => {
    return groupCartBySeller(lines);
  }, [lines]);

  // Overall Cart Grand Totals
  const overallTotals = useMemo(() => {
    return cartTotals(lines);
  }, [lines]);

  const handleQtyChange = (productId, newQty) => {
    dispatch(updateQty({ productId, qty: newQty }));
  };

  const handleRemove = (productId) => {
    dispatch(removeLine(productId));
  };

  const handleSaveForLater = (productId) => {
    dispatch(saveForLater(productId));
  };

  const handleAcknowledge = (productId) => {
    dispatch(acknowledgeFlag(productId));
  };

  const handleProceedToCheckout = () => {
    if (hasFlags) {
      alert('Please review and acknowledge all price and availability updates before checking out.');
      return;
    }
    navigate('/consumer/checkout');
  };

  return (
    <DashboardShell role="consumer">
      <div className="shop-page-container animate-fade-in-up">
        <div className="inv-page-header">
          <div className="inv-header-title">
            <h1>Wholesale Cart ({lines.length} items)</h1>
            <p>Orders are dispatched separately by each certified supplier.</p>
          </div>
        </div>

        {lines.length === 0 && savedForLater.length === 0 ? (
          <div className="empty-state-card text-center p-12">
            <ShoppingCart size={48} className="mx-auto text-muted mb-3" />
            <h2 className="font-bold text-lg mb-1">Your wholesale cart is empty</h2>
            <p className="text-muted text-sm mb-4">
              Explore our industrial machinery, electronic components, and packaging catalogs.
            </p>
            <Link to="/consumer/shop" className="btn btn-primary btn-sm">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Left: Supplier Groups */}
            <div className="cart-main-items">
              {hasFlags && (
                <div className="cart-flag-banner mb-4" role="alert">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber flex-shrink-0" />
                    <div>
                      <strong className="block text-sm">Cart Items Have Live Store Updates</strong>
                      <span className="text-xs">
                        Pricing or stock availability changed in the catalog. Please review and acknowledge flags below to unlock checkout.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {sellerGroups.map((group) => {
                const isApproved = group.sellerVerificationStatus === 'approved';

                return (
                  <div key={group.sellerId} className="seller-cart-group">
                    {/* Seller Header */}
                    <div className="seller-cart-header">
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-primary" />
                        <span className="font-bold text-sm text-slate-800">{group.sellerName}</span>
                        {isApproved && (
                          <span className="seller-verified-tag text-xs" title="Verified TradeLink Supplier">
                            <ShieldCheck size={12} />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted">
                        Fulfillment Order Group ({group.lines.length} items)
                      </span>
                    </div>

                    {/* Group Items */}
                    <div className="p-4">
                      {group.lines.map((item) => (
                        <CartItem
                          key={item.productId}
                          item={item}
                          onQtyChange={handleQtyChange}
                          onRemove={handleRemove}
                          onSaveForLater={handleSaveForLater}
                          onAcknowledgeFlag={handleAcknowledge}
                        />
                      ))}
                    </div>

                    {/* Group Subtotals Footer */}
                    <div className="seller-cart-footer">
                      <span className="text-muted">Supplier Subtotal (inc. GST):</span>
                      <span className="font-bold text-base text-primary">
                        ₹{Number(group.totals.total).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Saved For Later Section */}
              {savedForLater.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Bookmark size={18} className="text-muted" />
                    <h3 className="font-bold text-base">Saved for Later ({savedForLater.length})</h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {savedForLater.map((saved) => (
                      <div key={saved.productId} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">{saved.title}</div>
                          <span className="text-xs text-muted">SKU: {saved.sku} | Saved Qty: {saved.qty}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => dispatch(restoreFromSaved(saved.productId))}
                          >
                            <RotateCcw size={12} />
                            <span>Move to Cart</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs text-danger"
                            onClick={() => dispatch(removeFromSaved(saved.productId))}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Order Summary Sidebar */}
            {lines.length > 0 && (
              <aside className="cart-summary-card">
                <h3 className="font-bold text-base mb-4 pb-2 border-b">Wholesale Order Summary</h3>

                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex justify-between">
                    <span>Catalog Subtotal:</span>
                    <span className="font-semibold">₹{Number(overallTotals.subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Applicable GST:</span>
                    <span className="font-semibold">₹{Number(overallTotals.gstAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted">
                    <span>Suppliers Count:</span>
                    <span>{sellerGroups.length} separate orders</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold py-3 border-t border-b border-slate-200 mb-6">
                  <span>Grand Total:</span>
                  <span className="text-primary font-bold">
                    ₹{Number(overallTotals.grandTotal).toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary w-full py-3"
                  disabled={hasFlags}
                  onClick={handleProceedToCheckout}
                  title={hasFlags ? 'Resolve flagged cart updates first' : undefined}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </button>

                {hasFlags && (
                  <p className="text-xs text-danger text-center mt-2">
                    Action required: Please acknowledge all price changes above to proceed.
                  </p>
                )}

                <div className="mt-4 pt-4 border-t text-xs text-muted space-y-1">
                  <p>✔ Verified B2B Tax Invoice generated per order</p>
                  <p>✔ Real-time warehouse inventory reservation</p>
                  <p>✔ Supplier escrow & COD payment protection</p>
                </div>
              </aside>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

