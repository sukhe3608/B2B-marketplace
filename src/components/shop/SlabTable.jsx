/* ============================================================
   TradeLink — SlabTable Component
   Wholesale slab pricing grid highlighting active tier.
   ============================================================ */
import React from 'react';
import './shop.css';

export default function SlabTable({ slabs = [], currentQty = 1, unit = 'pcs' }) {
  if (!slabs || slabs.length === 0) return null;

  // Determine active slab based on currentQty
  // Active is the highest minQty slab where minQty <= currentQty
  const sorted = [...slabs].sort((a, b) => a.minQty - b.minQty);
  let activeIndex = -1;
  for (let i = 0; i < sorted.length; i++) {
    if (currentQty >= sorted[i].minQty) {
      activeIndex = i;
    }
  }

  return (
    <div className="slab-table-container">
      <div className="slab-table-title">Wholesale Volume Pricing</div>
      <div className="slab-grid">
        {sorted.map((slab, idx) => {
          const isCurrent = idx === activeIndex;
          const nextSlab = sorted[idx + 1];
          const rangeLabel = nextSlab
            ? `${slab.minQty} – ${nextSlab.minQty - 1} ${unit}`
            : `${slab.minQty}+ ${unit}`;

          return (
            <div
              key={idx}
              className={`slab-card ${isCurrent ? 'slab-card-active' : ''}`}
              title={isCurrent ? 'Active pricing tier for your current quantity' : undefined}
            >
              {isCurrent && <span className="active-tier-tag">Active Tier</span>}
              <span className="slab-range">{rangeLabel}</span>
              <span className="slab-price">₹{Number(slab.price).toLocaleString('en-IN')}</span>
              <span className="slab-unit">per {unit}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

