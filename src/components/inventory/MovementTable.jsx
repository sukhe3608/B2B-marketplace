/* ============================================================
   TradeLink — MovementTable Component
   Renders stock ledger history with colored movement type chips.
   ============================================================ */
import React from 'react';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Lock, Unlock, RotateCcw } from 'lucide-react';
import './inventory.css';

const TYPE_CONFIG = {
  in: { label: 'Stock In', colorClass: 'chip-green', icon: ArrowUpRight },
  out: { label: 'Stock Out', colorClass: 'chip-red', icon: ArrowDownLeft },
  adjust: { label: 'Adjustment', colorClass: 'chip-purple', icon: RefreshCw },
  reserve: { label: 'Reserved', colorClass: 'chip-amber', icon: Lock },
  release: { label: 'Released', colorClass: 'chip-blue', icon: Unlock },
  return: { label: 'Customer Return', colorClass: 'chip-teal', icon: RotateCcw },
};

export default function MovementTable({ movements = [], showProductColumn = false, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="table-loading-container">
        <p>Loading ledger movements...</p>
      </div>
    );
  }

  if (!movements || movements.length === 0) {
    return (
      <div className="empty-state-card">
        <p className="empty-title">No movements recorded</p>
        <p className="empty-desc">Stock changes will automatically log here as orders and adjustments occur.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive-container">
      <table className="custom-table" aria-label="Stock movement ledger">
        <thead>
          <tr>
            <th scope="col">Timestamp</th>
            {showProductColumn && <th scope="col">Product</th>}
            <th scope="col">Type</th>
            <th scope="col" className="text-right">Quantity</th>
            <th scope="col">Reason / Reference</th>
            <th scope="col">Actor</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => {
            const conf = TYPE_CONFIG[m.type] || { label: m.type, colorClass: 'chip-gray', icon: RefreshCw };
            const Icon = conf.icon;
            const isNegative = m.type === 'out';
            const isPositive = m.type === 'in' || m.type === 'return';
            const sign = isPositive ? '+' : isNegative ? '-' : '';

            const dateStr = m.createdAt
              ? new Date(m.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—';

            return (
              <tr key={m.id}>
                <td className="cell-time">{dateStr}</td>
                {showProductColumn && (
                  <td className="cell-product">
                    <span className="product-title-cell">{m.productTitle || m.productId}</span>
                    {m.productSku && <span className="product-sku-sub">SKU: {m.productSku}</span>}
                  </td>
                )}
                <td>
                  <span className={`status-chip ${conf.colorClass}`}>
                    <Icon size={12} className="chip-icon" />
                    <span>{conf.label}</span>
                  </span>
                </td>
                <td className="cell-qty text-right">
                  <span className={isPositive ? 'text-green font-semibold' : isNegative ? 'text-danger font-semibold' : 'font-semibold'}>
                    {sign}{Math.abs(m.qty)}
                  </span>
                </td>
                <td className="cell-reason">
                  <div className="reason-text">{m.reason || 'Manual change'}</div>
                  {m.refType && m.refId && (
                    <span className="ref-sub">
                      Ref: {m.refType} #{m.refId}
                    </span>
                  )}
                </td>
                <td className="cell-actor">
                  <span className="actor-badge">{m.actor || 'system'}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

