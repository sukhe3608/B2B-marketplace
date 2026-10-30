/* ============================================================
   TradeLink — MovementsLedgerPage (/seller/inventory/movements)
   Complete immutable stock audit ledger with product filters,
   movement type selectors, and CSV export.
   ============================================================ */
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, RefreshCw, FileText } from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import MovementTable from '../../../components/inventory/MovementTable';
import { useAuth, useQuery } from '../../../hooks';
import { inventoryService } from '../../../services/inventoryService';
import { unparseCSV, downloadCSV } from '../../../utils/csvHelper';
import './inventory-pages.css';

export default function MovementsLedgerPage() {
  const { user } = useAuth();
  const sellerId = user?.sellerId || 'sel-001';

  const [searchParams, setSearchParams] = useSearchParams();
  const typeFilter = searchParams.get('type') || '';
  const productFilter = searchParams.get('productId') || '';

  // Fetch list of seller's products for dropdown
  const { data: productsData } = useQuery(
    ['inventory', 'productsList', sellerId],
    () => inventoryService.getSellerProducts(sellerId, { limit: 100 })
  );
  const products = productsData?.products || [];

  // Fetch movements
  const {
    data: movements = [],
    isLoading,
    refetch,
  } = useQuery(
    ['inventory', 'movementsLedger', sellerId, { type: typeFilter, productId: productFilter }],
    () => inventoryService.getMovements(sellerId, { type: typeFilter, productId: productFilter })
  );

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val);
    else next.delete(key);
    setSearchParams(next);
  };

  const handleExportCSV = () => {
    if (!movements || movements.length === 0) return;
    const formatted = movements.map((m) => ({
      id: m.id,
      timestamp: m.createdAt,
      productId: m.productId,
      productTitle: m.productTitle,
      sku: m.productSku,
      type: m.type,
      qty: m.qty,
      reason: m.reason,
      actor: m.actor,
      refType: m.refType || '',
      refId: m.refId || '',
    }));

    const csv = unparseCSV(formatted);
    downloadCSV(csv, `stock_ledger_${sellerId}_${Date.now()}.csv`);
  };

  return (
    <DashboardShell role="seller">
      <div className="inv-page-container animate-fade-in-up">
        {/* Page Header */}
        <div className="inv-page-header">
          <div className="inv-header-title">
            <h1>Stock Movement Ledger</h1>
            <p>Immutable audit trail of all inventory receipts, orders, deductions, and adjustments.</p>
          </div>
          <div className="inv-header-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => refetch()}
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={movements.length === 0}
              onClick={handleExportCSV}
            >
              <Download size={14} />
              <span>Export Ledger (CSV)</span>
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="inv-toolbar">
          <div className="toolbar-filters flex-1">
            {/* Product Selector */}
            <select
              className="toolbar-select flex-1"
              value={productFilter}
              onChange={(e) => updateParam('productId', e.target.value)}
              aria-label="Filter by product"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.title}
                </option>
              ))}
            </select>

            {/* Type Selector */}
            <select
              className="toolbar-select"
              value={typeFilter}
              onChange={(e) => updateParam('type', e.target.value)}
              aria-label="Filter by movement type"
            >
              <option value="">All Movement Types</option>
              <option value="in">Stock In (Restock)</option>
              <option value="out">Stock Out (Shipped / Damaged)</option>
              <option value="adjust">Manual Adjustments</option>
              <option value="reserve">Reserved (Order Placed)</option>
              <option value="release">Released (Cancelled / Rejected)</option>
              <option value="return">Customer Returns</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="inv-section-card">
          <div className="inv-section-header">
            <h3>Audit Records ({movements.length})</h3>
            <span className="text-xs text-muted">Sorted chronologically descending</span>
          </div>

          <MovementTable
            movements={movements}
            showProductColumn={true}
            isLoading={isLoading}
          />
        </div>
      </div>
    </DashboardShell>
  );
}

