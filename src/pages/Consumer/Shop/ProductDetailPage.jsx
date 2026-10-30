/* ============================================================
   TradeLink — Consumer ProductDetailPage (/consumer/shop/:id)
   Product gallery, wholesale slab table, MOQ & lead time, seller card,
   stepper, Add to Cart, Request Quote (RFQ), wishlist, & related items.
   ============================================================ */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft, Heart, ShoppingCart, MessageSquare, Clock, ShieldCheck,
  Truck, CheckCircle2, AlertCircle, Share2
} from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import StockBadge from '../../../components/shop/StockBadge';
import SlabTable from '../../../components/shop/SlabTable';
import QuantityStepper from '../../../components/shop/QuantityStepper';
import SellerCard from '../../../components/shop/SellerCard';
import ProductCard from '../../../components/shop/ProductCard';
import { useAuth, useQuery } from '../../../hooks';
import { shopService } from '../../../services/shopService';
import { shopQueryKeys } from '../../../features/shop/shopQueryKeys';
import { addLine } from '../../../store/cartSlice';
import { addItem as addWishlist, removeItem as removeWishlist, selectWishlistItems } from '../../../store/wishlistSlice';
import './shop-pages.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const consumerId = (user?.email === 'consumer@demo.com' || !user?.id) ? 'consumer-demo' : user.id;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [rfqQty, setRfqQty] = useState(50);
  const [rfqMsg, setRfqMsg] = useState('');
  const [rfqSubmitting, setRfqSubmitting] = useState(false);
  const [rfqSuccess, setRfqSuccess] = useState(false);
  const [cartAddedToast, setCartAddedToast] = useState(false);

  // Redux Wishlist
  const wishlistItems = useSelector(selectWishlistItems);
  const isWishlisted = wishlistItems.some((w) => w.productId === id);

  // Product Query
  const {
    data: product,
    isLoading,
    refetch,
  } = useQuery(shopQueryKeys.product(id), () => shopService.getProductById(id));

  // Related Products Query
  const { data: related = [] } = useQuery(
    shopQueryKeys.relatedProducts(id, product?.categoryId),
    () => (product?.categoryId ? shopService.getRelatedProducts(id, product.categoryId) : []),
    { enabled: !!product?.categoryId }
  );

  // Set initial qty to product MOQ
  useEffect(() => {
    if (product) {
      setQty(product.moq || 1);
      setRfqQty(product.moq ? product.moq * 5 : 50);
    }
  }, [product]);

  if (isLoading) {
    return (
      <DashboardShell role="consumer">
        <div className="shop-page-container p-8">
          <p className="text-muted">Loading product specifications...</p>
        </div>
      </DashboardShell>
    );
  }

  if (!product) {
    return (
      <DashboardShell role="consumer">
        <div className="shop-page-container text-center p-12">
          <AlertCircle size={44} className="mx-auto text-danger mb-3" />
          <h2 className="font-bold text-xl mb-2">Product Not Available</h2>
          <p className="text-muted text-sm mb-6">
            This listing may have been archived or the supplier account is under review.
          </p>
          <Link to="/consumer/shop" className="btn btn-primary btn-sm">
            Browse Wholesale Catalog
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const {
    title,
    sku,
    description,
    images = [],
    seller,
    priceSlabs = [],
    moq = 1,
    unit = 'pcs',
    leadTimeDays = 3,
    gstRate = 18,
    stockStatus,
    available = 0,
    trackStock = true,
  } = product;

  const currentImage = images[activeImageIndex] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=700&auto=format&fit=crop&q=60';

  const isOutOfStock = stockStatus === 'out_of_stock';
  const isMadeToOrder = stockStatus === 'made_to_order';

  const handleToggleWishlist = () => {
    if (isWishlisted) {
      dispatch(removeWishlist(product.id));
    } else {
      dispatch(
        addWishlist({
          productId: product.id,
          title: product.title,
          sku: product.sku,
          image: images[0] || '',
          price: priceSlabs[0]?.price || 0,
        })
      );
    }
  };

  const handleAddToCart = () => {
    dispatch(
      addLine({
        productId: product.id,
        sellerId: product.sellerId,
        sellerName: seller?.name || 'TradeLink Supplier',
        title: product.title,
        sku: product.sku,
        images: product.images || [],
        moq: product.moq || 1,
        unit: product.unit || 'pcs',
        gstRate: product.gstRate || 18,
        priceSlabs: product.priceSlabs || [],
        qty: Number(qty) || moq,
        available: product.available || 999,
        trackStock: product.trackStock,
      })
    );
    setCartAddedToast(true);
    setTimeout(() => setCartAddedToast(false), 2500);
  };

  const handleSendRFQ = async (e) => {
    e.preventDefault();
    setRfqSubmitting(true);
    try {
      await shopService.createRFQ({
        productId: product.id,
        consumerId,
        sellerId: product.sellerId,
        qty: Number(rfqQty) || moq,
        message: rfqMsg.trim(),
      });
      setRfqSubmitting(false);
      setRfqSuccess(true);
      setTimeout(() => {
        setRfqSuccess(false);
        setRfqModalOpen(false);
      }, 1500);
    } catch (err) {
      setRfqSubmitting(false);
      alert('Failed to submit quote request: ' + err.message);
    }
  };

  return (
    <DashboardShell role="consumer">
      <div className="shop-page-container animate-fade-in-up">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link to="/consumer/shop" className="text-sm text-muted inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft size={14} />
            <span>Back to Catalog</span>
          </Link>
        </div>

        {/* 2-Column Product Detail Layout */}
        <div className="pdp-grid">
          {/* Left Column: Image Gallery */}
          <div className="pdp-gallery">
            <div className="pdp-main-image-wrap">
              <img src={currentImage} alt={title} className="pdp-main-image" />
            </div>

            {images.length > 1 && (
              <div className="pdp-thumbs-row">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`pdp-thumb-btn ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}

            {/* Seller Information Card */}
            <div className="mt-4">
              <SellerCard seller={seller} />
            </div>
          </div>

          {/* Right Column: Title, Specs, Wholesale Slabs, Actions */}
          <div className="pdp-info">
            <div className="flex items-center justify-between gap-2">
              <StockBadge stockStatus={stockStatus} available={available} showCount={true} />
              <button
                type="button"
                className={`card-wishlist-btn relative !top-0 !right-0 ${isWishlisted ? 'wishlist-active' : ''}`}
                onClick={handleToggleWishlist}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} fill={isWishlisted ? 'var(--color-danger, #EF4444)' : 'none'} color={isWishlisted ? 'var(--color-danger, #EF4444)' : '#64748B'} />
              </button>
            </div>

            <h1 className="pdp-title">{title}</h1>
            <div className="text-xs text-muted font-mono">SKU: {sku}</div>

            {/* Wholesale Slab Table */}
            <SlabTable slabs={priceSlabs} currentQty={qty} unit={unit} />

            {/* Essential Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <div>
                <span className="text-muted block">Min Order Qty:</span>
                <span className="font-bold text-sm">{moq} {unit}</span>
              </div>
              <div>
                <span className="text-muted block">Dispatch Lead Time:</span>
                <span className="font-bold text-sm">{leadTimeDays} business days</span>
              </div>
              <div>
                <span className="text-muted block">GST Rate:</span>
                <span className="font-bold text-sm">{gstRate}%</span>
              </div>
            </div>

            {/* Action Box: Stepper + Add to Cart / Request Quote */}
            <div className="pdp-action-card">
              {!isMadeToOrder && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-muted block mb-1">Select Order Quantity ({unit})</span>
                    <QuantityStepper
                      qty={qty}
                      onChange={setQty}
                      moq={moq}
                      available={available}
                      trackStock={trackStock}
                      disabled={isOutOfStock}
                      unit={unit}
                    />
                  </div>

                  <div className="w-full sm:w-auto flex-1 max-w-xs self-stretch sm:self-auto flex items-end">
                    <button
                      type="button"
                      className="btn btn-primary w-full py-3"
                      disabled={isOutOfStock || qty < moq}
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart size={16} />
                      <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Made to order / Custom Quote Button */}
              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  className={`btn ${isMadeToOrder ? 'btn-primary w-full py-3' : 'btn-secondary btn-sm flex-1'}`}
                  onClick={() => setRfqModalOpen(true)}
                >
                  <MessageSquare size={15} />
                  <span>Request Custom Volume Quote</span>
                </button>
              </div>

              {cartAddedToast && (
                <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Added {qty} {unit} to your wholesale cart!</span>
                  <Link to="/consumer/cart" className="font-bold underline ml-auto">View Cart</Link>
                </div>
              )}
            </div>

            {/* Description & Technical Specifications */}
            <div className="mt-2">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted mb-2">Description & Specifications</h3>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {description || 'Standard industrial wholesale specifications.'}
              </p>
            </div>
          </div>
        </div>

        {/* Related Products from same category */}
        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="font-bold text-lg mb-4">Related Industrial Components</h2>
            <div className="shop-grid">
              {related.slice(0, 3).map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  isWishlisted={wishlistItems.some((w) => w.productId === item.id)}
                  onToggleWishlist={() => dispatch(addWishlist({ productId: item.id, title: item.title, sku: item.sku }))}
                  onAddToCart={() => dispatch(addLine({ productId: item.id, title: item.title, qty: item.moq || 1, priceSlabs: item.priceSlabs }))}
                />
              ))}
            </div>
          </div>
        )}

        {/* Request Quote (RFQ) Modal Dialog */}
        {rfqModalOpen && (
          <div className="modal-backdrop" onClick={() => setRfqModalOpen(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()} role="dialog">
              <div className="modal-header">
                <div>
                  <h3>Request Wholesale Quote</h3>
                  <p className="modal-subtitle">{title} (Supplier: {seller?.name})</p>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setRfqModalOpen(false)}
                >
                  ×
                </button>
              </div>

              {rfqSuccess ? (
                <div className="p-8 text-center">
                  <CheckCircle2 size={40} className="mx-auto text-green mb-2" />
                  <h4 className="font-bold text-base mb-1">Quote Request Sent!</h4>
                  <p className="text-xs text-muted">The supplier will reply with a customized rate.</p>
                </div>
              ) : (
                <form onSubmit={handleSendRFQ}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label className="form-label" htmlFor="rfq-qty">Target Quantity ({unit}) *</label>
                      <input
                        id="rfq-qty"
                        type="number"
                        min={moq}
                        required
                        className="form-input"
                        value={rfqQty}
                        onChange={(e) => setRfqQty(e.target.value)}
                      />
                      <span className="text-xs text-muted">Must meet supplier MOQ of {moq} {unit}.</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="rfq-msg">Specific Requirements / Delivery Schedule</label>
                      <textarea
                        id="rfq-msg"
                        rows="3"
                        className="form-textarea"
                        placeholder="e.g. Inquiring on 500 units delivered by 15th next month with custom packaging..."
                        value={rfqMsg}
                        onChange={(e) => setRfqMsg(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setRfqModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={rfqSubmitting}
                    >
                      {rfqSubmitting ? 'Sending...' : 'Send Inquiry'}
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

