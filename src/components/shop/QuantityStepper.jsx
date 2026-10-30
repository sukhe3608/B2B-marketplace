/* ============================================================
   TradeLink — QuantityStepper Component
   Accessible quantity controller enforcing MOQ and Available caps.
   ============================================================ */
import { Minus, Plus, AlertCircle } from 'lucide-react';
import './shop.css';

export default function QuantityStepper({
  qty = 1,
  onChange,
  moq = 1,
  available = 9999,
  trackStock = true,
  disabled = false,
  unit = 'units',
}) {
  const isBelowMoq = qty < moq;
  const isAtMax = trackStock && qty >= available;
  const isAtMin = qty <= 1;

  const handleDecrement = () => {
    if (disabled || isAtMin) return;
    const nextVal = Math.max(1, qty - 1);
    onChange(nextVal);
  };

  const handleIncrement = () => {
    if (disabled) return;
    if (trackStock && qty >= available) return;
    onChange(qty + 1);
  };

  const handleInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      onChange('');
      return;
    }
    if (trackStock && val > available) {
      onChange(available);
      return;
    }
    onChange(Math.max(1, val));
  };

  return (
    <div className="stepper-wrap">
      <div className={`quantity-stepper ${disabled ? 'stepper-disabled' : ''}`}>
        <button
          type="button"
          className="stepper-btn"
          onClick={handleDecrement}
          disabled={disabled || isAtMin}
          aria-label={`Decrease quantity. Current is ${qty}`}
        >
          <Minus size={15} />
        </button>

        <input
          type="number"
          min="1"
          max={trackStock ? available : undefined}
          className={`stepper-input ${isBelowMoq ? 'input-warning' : ''}`}
          value={qty}
          onChange={handleInputChange}
          disabled={disabled}
          aria-label={`Quantity in ${unit}`}
        />

        <button
          type="button"
          className="stepper-btn"
          onClick={handleIncrement}
          disabled={disabled || isAtMax}
          aria-label={`Increase quantity. Current is ${qty}`}
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Validation warnings */}
      {isBelowMoq && (
        <div className="stepper-warning text-warning" role="alert">
          <AlertCircle size={13} />
          <span>Minimum order quantity is {moq} {unit}.</span>
        </div>
      )}

      {trackStock && available > 0 && isAtMax && (
        <div className="stepper-warning text-muted" role="status">
          <span>Max available stock reached ({available} {unit}).</span>
        </div>
      )}
    </div>
  );
}

