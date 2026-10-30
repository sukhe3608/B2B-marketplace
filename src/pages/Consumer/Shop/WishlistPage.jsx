/* ============================================================
   TradeLink — WishlistPage (/consumer/wishlist)
   Saved products, Move to Cart, Remove, and Back-in-Stock Alert Toggle.
   ============================================================ */
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Heart, ShoppingCart, Trash2, Bell, BellOff, ArrowRight, Package
} from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import {
  selectWishlistItems,
  removeItem,
  toggleAlert,
} from '../../../store/wishlistSlice';
import { addLine } from '../../../store/cartSlice';
import { shopService } from '../../../services/shopService';
import './shop-pages.css';

export default function WishlistPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);

  const handleMoveToCart = async (item) => {
    try {
      const prod = await shopService.getProductById(item.productId);
      if (prod) {
        dispatch(
          addLine({
            productId: prod.id,
            sellerId: prod.sellerId,
            sellerName: prod.seller?.name || 'TradeLink Supplier',
            title: prod.title,
            sku: prod.sku,
            images: prod.images || [],
            moq: prod.moq || 1,
            unit: prod.unit || 'pcs',
            gstRate: prod.gstRate || 18,
            priceSlabs: prod.priceSlabs || [],
            qty: prod.moq || 1,
            available: prod.available || 999,
            trackStock: prod.trackStock,
          })
        );
        dispatch(removeItem(item.productId));
        navigate('/consumer/cart');
      }
    } catch (err) {
      alert('Could not move to cart: ' + err.message);
    }
  };

  const handleToggleAlert = (productId) => {
    dispatch(toggleAlert(productId));
  };

  return (
    <DashboardShell role="consumer">
      <div className="shop-page-container animate-fade-in-up">
        <div className="inv-page-header">
          <div className="inv-header-title">
            <h1>My Saved Products & Wishlist</h1>
            <p>Keep track of components and enable restock alerts when low inventory is replenished.</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="empty-state-card text-center p-12">
            <Heart size={44} className="mx-auto text-muted mb-3" />
            <h3 className="font-bold text-lg mb-1">Your wishlist is empty</h3>
            <p className="text-muted text-sm mb-4">
              Click the heart icon on any product in the wholesale catalog to save it for later.
            </p>
            <Link to="/consumer/shop" className="btn btn-primary btn-sm">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const hasAlert = !!item.alertEnabled;

              return (
                <div key={item.productId} className="inv-section-card flex flex-col justify-between">
                  <div>
                    <div className="aspect-video w-full rounded-md overflow-hidden bg-slate-100 mb-3">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          <Package size={28} />
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-sm mb-1 line-clamp-2">
                      <Link to={`/consumer/shop/${item.productId}`} className="hover:text-primary">
                        {item.title}
                      </Link>
                    </h3>
                    {item.sku && <div className="text-xs text-muted font-mono mb-2">SKU: {item.sku}</div>}

                    {item.price > 0 && (
                      <div className="font-bold text-base text-slate-900 mb-3">
                        From ₹{Number(item.price).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  <div>
                    {/* Restock Notification Alert Toggle */}
                    <div className="p-2 mb-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {hasAlert ? (
                          <Bell size={14} className="text-amber" />
                        ) : (
                          <BellOff size={14} className="text-muted" />
                        )}
                        <span className="text-xs font-medium">
                          {hasAlert ? 'Restock Alert Active' : 'Notify when in stock'}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={`btn btn-xs ${hasAlert ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleToggleAlert(item.productId)}
                      >
                        {hasAlert ? 'Alert Set' : 'Enable'}
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t">
                      <button
                        type="button"
                        className="btn btn-primary btn-xs flex-1 inline-flex items-center justify-center gap-1"
                        onClick={() => handleMoveToCart(item)}
                      >
                        <ShoppingCart size={13} />
                        <span>Move to Cart</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs text-danger"
                        title="Remove from wishlist"
                        aria-label="Remove from wishlist"
                        onClick={() => dispatch(removeItem(item.productId))}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

