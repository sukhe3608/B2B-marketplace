/* ============================================================
   TradeLink — StockBadge Component
   Accessible stock status indicator showing both icon/color and text.
   ============================================================ */
import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Wrench } from 'lucide-react';
import './shop.css';

export default function StockBadge({ stockStatus, available = 0, showCount = false }) {
  switch (stockStatus) {
    case 'in_stock':
      return (
        <span
          className="stock-badge badge-in-stock"
          role="status"
          aria-label={showCount ? `In stock: ${available} units available` : 'In stock'}
        >
          <CheckCircle2 size={13} className="badge-icon" />
          <span>{showCount && available > 0 ? `In Stock (${available})` : 'In Stock'}</span>
        </span>
      );

    case 'low_stock':
      return (
        <span
          className="stock-badge badge-low-stock"
          role="status"
          aria-label={`Low stock: only ${available} units left`}
        >
          <AlertTriangle size={13} className="badge-icon" />
          <span>{available > 0 ? `Low Stock (Only ${available} left)` : 'Low Stock'}</span>
        </span>
      );

    case 'out_of_stock':
      return (
        <span
          className="stock-badge badge-out-of-stock"
          role="status"
          aria-label="Out of stock"
        >
          <XCircle size={13} className="badge-icon" />
          <span>Out of Stock</span>
        </span>
      );

    case 'made_to_order':
      return (
        <span
          className="stock-badge badge-made-to-order"
          role="status"
          aria-label="Made to order product"
        >
          <Wrench size={13} className="badge-icon" />
          <span>Made to Order</span>
        </span>
      );

    default:
      return null;
  }
}

