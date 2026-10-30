/* ============================================================
   TradeLink — CartItem Component
   Individual line item in customer cart with GST breakdown,
   re-validation flags, and save for later options.
   ============================================================ */
import { Link } from 'react-router-dom';
import { Trash2, Bookmark, AlertTriangle, Check } from 'lucide-react';
import QuantityStepper from './QuantityStepper';
import ProductImage from '../common/ProductImage';
import './shop.css';

export default function CartItem({
  item,
  onQtyChange,
  onRemove,
  onSaveForLater,
  onAcknowledgeFlag,
}) {
  if (!item) return null;

  const {
    productId,
    title,
    sku,
    images = [],
    unitPrice = 0,
    qty = 1,
    gstRate = 18,
    moq = 1,
    unit = 'pcs',
    available = 999,
    trackStock = true,
    flags = [],
    subtotal = 0,
    gstAmount = 0,
    total = 0,
  } = item;

  const imageSrc = images && images.length > 0 ? images[0] : null;
  const hasFlags = flags && flags.length > 0;

  return (
    <div className={`cart-item-row ${hasFlags ? 'cart-item-flagged' : ''}`}>
      {/* Flags banner if any warnings */}
      {hasFlags && (
        <div className="cart-flag-banner" role="alert">
          <div className="flag-messages">
            <AlertTriangle size={15} className="flag-icon" />
            <div className="flag-text-list">
              {flags.map((f, i) => (
                <span key={i} className="flag-msg">{f.message || f}</span>
              ))}
            </div>
          </div>
          {onAcknowledgeFlag && (
            <button
              type="button"
              className="btn btn-secondary btn-xs acknowledge-btn"
              onClick={() => onAcknowledgeFlag(productId)}
            >
              <Check size={12} />
              <span>Acknowledge</span>
            </button>
          )}
        </div>
      )}

      <div className="cart-item-main">
        {/* Media */}
        <div className="cart-item-thumb">
          <Link to={`/consumer/shop/${productId}`}>
            <ProductImage
              src={imageSrc}
              alt={title}
              style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
            />
          </Link>
        </div>

        {/* Info */}
        <div className="cart-item-info">
          <h4 className="cart-item-title">
            <Link to={`/consumer/shop/${productId}`}>{title}</Link>
          </h4>
          {sku && <div className="cart-item-sku">SKU: {sku}</div>}
          <div className="cart-item-unit-price">
            ₹{Number(unitPrice).toLocaleString('en-IN')} <span className="text-muted">/ {unit}</span>
          </div>

          {/* Stepper on mobile / desktop */}
          <div className="cart-item-stepper-wrap">
            <QuantityStepper
              qty={qty}
              onChange={(newQty) => onQtyChange(productId, newQty)}
              moq={moq}
              available={available}
              trackStock={trackStock}
              unit={unit}
            />
          </div>
        </div>

        {/* Pricing breakdown */}
        <div className="cart-item-totals">
          <div className="totals-line">
            <span className="totals-label">Subtotal:</span>
            <span className="totals-val">₹{Number(subtotal).toLocaleString('en-IN')}</span>
          </div>
          <div className="totals-line text-muted">
            <span className="totals-label">GST ({gstRate}%):</span>
            <span className="totals-val">₹{Number(gstAmount).toLocaleString('en-IN')}</span>
          </div>
          <div className="totals-line totals-grand">
            <span className="totals-label">Total:</span>
            <span className="totals-val font-bold">₹{Number(total).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Row action buttons */}
      <div className="cart-item-actions">
        {onSaveForLater && (
          <button
            type="button"
            className="cart-action-btn"
            onClick={() => onSaveForLater(productId)}
          >
            <Bookmark size={14} />
            <span>Save for Later</span>
          </button>
        )}
        <button
          type="button"
          className="cart-action-btn text-danger"
          onClick={() => onRemove(productId)}
        >
          <Trash2 size={14} />
          <span>Remove</span>
        </button>
      </div>
    </div>
  );
}

