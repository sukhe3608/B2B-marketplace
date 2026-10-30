/* ============================================================
   TradeLink — ProductCard Component
   B2B marketplace product card with slab pricing and stock state.
   ============================================================ */
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, MessageSquare, ShieldCheck, MapPin } from 'lucide-react';
import StockBadge from './StockBadge';
import ProductImage from '../common/ProductImage';
import './shop.css';

export default function ProductCard({
  product,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
}) {
  if (!product) return null;

  const {
    id,
    title,
    seller,
    images = [],
    priceSlabs = [],
    moq = 1,
    unit = 'pcs',
    stockStatus,
    available = 0,
  } = product;

  const primaryImage = images && images.length > 0
    ? images[0]
    : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60';

  // Calculate price range from slabs
  const minPrice = priceSlabs && priceSlabs.length > 0
    ? Math.min(...priceSlabs.map((s) => Number(s.price)))
    : 0;
  const maxPrice = priceSlabs && priceSlabs.length > 0
    ? Math.max(...priceSlabs.map((s) => Number(s.price)))
    : 0;

  const priceDisplay = minPrice === maxPrice
    ? `₹${minPrice.toLocaleString('en-IN')}`
    : `₹${minPrice.toLocaleString('en-IN')} – ₹${maxPrice.toLocaleString('en-IN')}`;

  const isOutOfStock = stockStatus === 'out_of_stock';
  const isMadeToOrder = stockStatus === 'made_to_order';

  const handleCardWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) onToggleWishlist(product);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product);
  };

  return (
    <div className={`shop-product-card ${isOutOfStock ? 'card-out-of-stock' : ''}`}>
      {/* Thumbnail area */}
      <div className="card-media-wrap">
        <Link to={`/consumer/shop/${id}`} className="card-media-link" tabIndex="-1" aria-hidden="true">
          <ProductImage src={primaryImage} alt={title} className="card-thumb" aspectRatio="video" />
        </Link>

        {/* Stock Badge on top left */}
        <div className="card-badge-overlay">
          <StockBadge stockStatus={stockStatus} available={available} />
        </div>

        {/* Wishlist Button on top right */}
        <button
          type="button"
          className={`card-wishlist-btn ${isWishlisted ? 'wishlist-active' : ''}`}
          onClick={handleCardWishlist}
          aria-label={isWishlisted ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
        >
          <Heart size={18} fill={isWishlisted ? 'var(--color-danger, #EF4444)' : 'none'} color={isWishlisted ? 'var(--color-danger, #EF4444)' : '#64748B'} />
        </button>
      </div>

      {/* Body content */}
      <div className="card-body">
        {/* Seller Info */}
        {seller && (
          <div className="card-seller-row">
            <span className="seller-name">{seller.name}</span>
            {seller.verificationStatus === 'approved' && (
              <span title="Verified Seller" className="verified-icon-inline">
                <ShieldCheck size={14} color="var(--color-primary, #4F46E5)" />
              </span>
            )}
            {seller.city && (
              <span className="seller-city">
                <MapPin size={11} />
                <span>{seller.city}</span>
              </span>
            )}
          </div>
        )}

        {/* Product Title */}
        <h3 className="card-title">
          <Link to={`/consumer/shop/${id}`} className="card-title-link" title={title}>
            {title}
          </Link>
        </h3>

        {/* Price & MOQ */}
        <div className="card-price-row">
          <div className="price-stack">
            <span className="price-amount">{priceDisplay}</span>
            <span className="price-per-unit">per {unit}</span>
          </div>
          <div className="moq-tag">
            <span>MOQ: <strong>{moq} {unit}</strong></span>
          </div>
        </div>

        {/* Action Button */}
        <div className="card-action-wrap">
          {isMadeToOrder ? (
            <Link
              to={`/consumer/shop/${id}#rfq`}
              className="btn btn-secondary btn-sm w-full card-action-btn"
            >
              <MessageSquare size={14} />
              <span>Request Quote</span>
            </Link>
          ) : isOutOfStock ? (
            <Link
              to={`/consumer/shop/${id}`}
              className="btn btn-disabled btn-sm w-full card-action-btn"
              disabled
            >
              <span>Out of Stock</span>
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm w-full card-action-btn"
              onClick={handleQuickAdd}
            >
              <ShoppingCart size={14} />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

