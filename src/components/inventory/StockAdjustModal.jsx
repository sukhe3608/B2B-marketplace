/* ============================================================
   TradeLink — StockAdjustModal Component
   Modal for performing stock adjustments (in, out, manual set)
   with required reasons and reservation enforcement.
   ============================================================ */
import { useState, useEffect } from 'react';
import { X, AlertTriangle, ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import './inventory.css';

export default function StockAdjustModal({
  isOpen,
  product,
  stockLevel,
  onClose,
  onSuccess,
}) {
  const [type, setType] = useState('in'); // 'in' | 'out' | 'adjust'
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setType('in');
      setQty('');
      setReason('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const onHand = stockLevel?.onHand ?? 0;
  const reserved = stockLevel?.reserved ?? 0;
  const available = onHand - reserved;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedQty = parseInt(qty, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError('Please enter a valid quantity greater than 0.');
      return;
    }

    if (!reason.trim()) {
      setError('A reason for this stock adjustment is mandatory.');
      return;
    }

    // Validation against reserved stock
    if (type === 'out') {
      if (onHand - parsedQty < reserved) {
        setError(
          `Cannot reduce stock by ${parsedQty} units. That would leave on-hand (${onHand - parsedQty}) below reserved (${reserved}).`
        );
        return;
      }
    } else if (type === 'adjust') {
      if (parsedQty < reserved) {
        setError(
          `New physical count (${parsedQty}) cannot be lower than reserved stock (${reserved} units).`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await inventoryService.adjustStock(product.id, {
        type,
        qty: parsedQty,
        reason: reason.trim(),
        actor: 'seller',
      });
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to update stock.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={isSubmitting ? undefined : onClose} role="presentation">
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adjust-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 id="adjust-modal-title">Adjust Stock Level</h3>
            <p className="modal-subtitle">{product.title} (SKU: {product.sku})</p>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Current Stock Metrics */}
            <div className="stock-summary-pills">
              <div className="summary-pill">
                <span className="pill-label">On Hand</span>
                <span className="pill-value">{onHand}</span>
              </div>
              <div className="summary-pill">
                <span className="pill-label">Reserved</span>
                <span className="pill-value text-amber">{reserved}</span>
              </div>
              <div className="summary-pill">
                <span className="pill-label">Available</span>
                <span className="pill-value text-green">{available}</span>
              </div>
            </div>

            {/* Adjustment Type Selector */}
            <div className="form-group">
              <label className="form-label">Adjustment Type</label>
              <div className="radio-button-group">
                <button
                  type="button"
                  className={`radio-btn-pill ${type === 'in' ? 'active' : ''}`}
                  onClick={() => setType('in')}
                >
                  <ArrowUpRight size={16} />
                  <span>Restock / In</span>
                </button>
                <button
                  type="button"
                  className={`radio-btn-pill ${type === 'out' ? 'active' : ''}`}
                  onClick={() => setType('out')}
                >
                  <ArrowDownRight size={16} />
                  <span>Shrinkage / Out</span>
                </button>
                <button
                  type="button"
                  className={`radio-btn-pill ${type === 'adjust' ? 'active' : ''}`}
                  onClick={() => setType('adjust')}
                >
                  <RefreshCw size={16} />
                  <span>Count Override</span>
                </button>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="form-group">
              <label htmlFor="adjust-qty-input" className="form-label">
                {type === 'adjust' ? 'New On-Hand Total Count' : 'Units to Add/Remove'} *
              </label>
              <input
                id="adjust-qty-input"
                type="number"
                min="1"
                step="1"
                required
                className="form-input"
                placeholder={type === 'adjust' ? `e.g. ${onHand + 10}` : 'e.g. 25'}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>

            {/* Reason Textarea */}
            <div className="form-group">
              <label htmlFor="adjust-reason-input" className="form-label">
                Reason (Mandatory) *
              </label>
              <textarea
                id="adjust-reason-input"
                rows="3"
                required
                className="form-textarea"
                placeholder="e.g. Supplier delivery batch #401, physical cycle count discrepancy..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {error && (
              <div className="form-error-banner" role="alert">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Apply Stock Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

