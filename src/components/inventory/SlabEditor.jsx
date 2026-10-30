/* ============================================================
   TradeLink — SlabEditor Component
   Multi-tier pricing slab manager with ascending minQty validation.
   ============================================================ */
import React from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import './inventory.css';

export default function SlabEditor({ slabs = [], onChange, error }) {
  const handleAddSlab = () => {
    const lastSlab = slabs[slabs.length - 1];
    const nextMin = lastSlab ? (parseInt(lastSlab.minQty, 10) || 1) * 2 : 1;
    const nextPrice = lastSlab ? Math.max(1, Math.round(Number(lastSlab.price) * 0.95)) : 100;
    onChange([...slabs, { minQty: nextMin, price: nextPrice }]);
  };

  const handleRemoveSlab = (index) => {
    if (slabs.length <= 1) return;
    const updated = slabs.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleFieldChange = (index, field, value) => {
    const updated = slabs.map((item, i) => {
      if (i !== index) return item;
      return {
        ...item,
        [field]: value === '' ? '' : Number(value),
      };
    });
    onChange(updated);
  };

  return (
    <div className="slab-editor-container">
      <div className="slab-editor-header">
        <div>
          <h4 className="slab-title">Wholesale Price Slabs</h4>
          <p className="slab-subtitle">Offer volume discounts for larger orders. Slabs must be in ascending order by minimum quantity.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleAddSlab}
        >
          <Plus size={14} />
          <span>Add Tier</span>
        </button>
      </div>

      <div className="slab-table-wrapper">
        <table className="slab-table">
          <thead>
            <tr>
              <th scope="col">Tier</th>
              <th scope="col">Min Qty</th>
              <th scope="col">Unit Price (₹)</th>
              <th scope="col" style={{ width: '48px' }}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {slabs.map((slab, index) => {
              const prevSlab = slabs[index - 1];
              const isInvalidMin = prevSlab && Number(slab.minQty) <= Number(prevSlab.minQty);
              const isInvalidPrice = Number(slab.price) <= 0;

              return (
                <tr key={index} className={isInvalidMin || isInvalidPrice ? 'slab-row-error' : ''}>
                  <td className="slab-tier-label">Tier {index + 1}</td>
                  <td>
                    <input
                      type="number"
                      min={index === 0 ? '1' : String(Number(prevSlab?.minQty || 0) + 1)}
                      step="1"
                      className={`form-input slab-input ${isInvalidMin ? 'input-error' : ''}`}
                      value={slab.minQty}
                      placeholder={index === 0 ? '1' : '10'}
                      onChange={(e) => handleFieldChange(index, 'minQty', e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="input-prefix-wrap">
                      <span className="input-prefix">₹</span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        className={`form-input slab-input slab-price-input ${isInvalidPrice ? 'input-error' : ''}`}
                        value={slab.price}
                        placeholder="500"
                        onChange={(e) => handleFieldChange(index, 'price', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="icon-action-btn btn-delete"
                      disabled={slabs.length <= 1}
                      title={slabs.length <= 1 ? 'At least one price tier is required' : 'Remove tier'}
                      aria-label={`Remove tier ${index + 1}`}
                      onClick={() => handleRemoveSlab(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="form-error-banner mt-2" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

