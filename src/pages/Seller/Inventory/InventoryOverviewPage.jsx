/* ============================================================
   TradeLink — InventoryOverviewPage (/seller/inventory)
   Overview dashboard: 4 KPI cards, low stock list, recent movements,
   pending orders count, and verification gating banner.
   ============================================================ */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, AlertTriangle, XCircle, DollarSign,
  ShoppingCart, ArrowRight, Plus, Upload, SlidersHorizontal, RefreshCw
} from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import VerificationBanner from '../../../components/inventory/VerificationBanner';
import MovementTable from '../../../components/inventory/MovementTable';
import StockAdjustModal from '../../../components/inventory/StockAdjustModal';
import { useAuth, useQuery } from '../../../hooks';
import { inventoryService } from '../../../services/inventoryService';
import { inventoryQueryKeys } from '../../../features/inventory/inventoryQueryKeys';
import { SkeletonStatCard } from '../../../components/common';
import { mockDb } from '../../../services/mockDb';
import './inventory-pages.css';

export default function InventoryOverviewPage() {
  const { user, verificationStatus } = useAuth();
  const sellerId = user?.sellerId || 'sel-001';
  const currentSeller = mockDb.findOne('sellers', (s) => s.id === sellerId);
  const effectiveStatus = (verificationStatus && verificationStatus !== 'none')
    ? verificationStatus
    : (currentSeller?.verificationStatus || 'approved');
  const canWrite = effectiveStatus === 'verified' || effectiveStatus === 'approved';

  const [adjustTarget, setAdjustTarget] = useState(null); // { product, stockLevel }

  const {
    data: overview,
    isLoading,
    refetch,
  } = useQuery(
    inventoryQueryKeys.overview(sellerId),
    () => inventoryService.getInventoryOverview(sellerId)
  );

  return (
    <DashboardShell role="seller">
      <div className="inv-page-container animate-fade-in-up">
        {/* Verification banner if pending or rejected */}
        <VerificationBanner verificationStatus={effectiveStatus} />

        {/* Page Header */}
        <div className="inv-page-header">
          <div className="inv-header-title">
            <h1>Inventory Overview</h1>
            <p>Real-time stock monitoring, alerts, and ledger history.</p>
          </div>
          <div className="inv-header-actions">
            <button
              onClick={() => refetch()}
              className="btn btn-secondary btn-sm"
              title="Refresh overview metrics"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
            <Link
              to="/seller/inventory/import"
              className={`btn btn-secondary btn-sm ${!canWrite ? 'disabled-action' : ''}`}
              title={!canWrite ? 'Available after verification' : undefined}
            >
              <Upload size={14} />
              <span>Bulk Import</span>
            </Link>
            <Link
              to="/seller/inventory/products/new"
              className={`btn btn-primary btn-sm ${!canWrite ? 'disabled-action' : ''}`}
              title={!canWrite ? 'Available after verification' : undefined}
            >
              <Plus size={14} />
              <span>Add New Product</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Cards */}
        {isLoading ? (
          <div className="kpi-grid">
            <SkeletonStatCard count={4} />
          </div>
        ) : (
          <div className="kpi-grid">
            {/* Total SKUs */}
            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-label">Total SKUs</span>
                <div className="kpi-icon-wrap"><Package size={18} /></div>
              </div>
              <div className="kpi-value">{overview?.totalSKUs ?? 0}</div>
              <span className="kpi-sub">Active catalog products</span>
            </div>

            {/* Low Stock SKUs */}
            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-label">Low Stock</span>
                <div className="kpi-icon-wrap" style={{ background: '#FEF3C7', color: '#D97706' }}>
                  <AlertTriangle size={18} />
                </div>
              </div>
              <div className="kpi-value text-amber">{overview?.lowStockCount ?? 0}</div>
              <span className="kpi-sub">At or below reorder level</span>
            </div>

            {/* Out of Stock SKUs */}
            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-label">Out of Stock</span>
                <div className="kpi-icon-wrap" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                  <XCircle size={18} />
                </div>
              </div>
              <div className="kpi-value text-danger">{overview?.outOfStockCount ?? 0}</div>
              <span className="kpi-sub">Unavailable for order placement</span>
            </div>

            {/* Total Stock Value */}
            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-label">Stock Value</span>
                <div className="kpi-icon-wrap" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                  <DollarSign size={18} />
                </div>
              </div>
              <div className="kpi-value">₹{(overview?.totalStockValue ?? 0).toLocaleString('en-IN')}</div>
              <span className="kpi-sub">Total on-hand valuation</span>
            </div>
          </div>
        )}

        {/* Pending Orders Alert Banner */}
        {(overview?.pendingOrdersCount ?? 0) > 0 && (
          <div className="verification-banner banner-info mb-4" role="status">
            <div className="banner-icon">
              <ShoppingCart size={20} />
            </div>
            <div className="banner-content">
              <strong>{overview.pendingOrdersCount} Pending Orders Require Attention</strong>
              <p>Reserved units are awaiting confirmation or shipping.</p>
            </div>
            <Link to="/seller/inventory/orders" className="banner-action-link">
              <span>View Incoming Orders</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Two Column Layout: Low Stock List + Recent Movements */}
        <div className="inv-grid-2col">
          {/* Low Stock Items List */}
          <div className="inv-section-card">
            <div className="inv-section-header">
              <h3>Low Stock Alert List</h3>
              <Link to="/seller/inventory/products?stockStatus=low_stock" className="text-sm font-semibold text-primary">
                View All
              </Link>
            </div>

            {isLoading ? (
              <p className="text-muted p-4">Loading stock alerts...</p>
            ) : (!overview?.lowStockProducts || overview.lowStockProducts.length === 0) ? (
              <div className="empty-state-card p-4 text-center">
                <p className="font-semibold text-green">All stock levels healthy!</p>
                <p className="text-sm text-muted">No products are currently at or below reorder threshold.</p>
              </div>
            ) : (
              <div className="table-responsive-container">
                <table className="custom-table" aria-label="Low stock alerts">
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: 44 }}></th>
                      <th scope="col">Product / SKU</th>
                      <th scope="col" className="text-right">Available</th>
                      <th scope="col" className="text-right">Reorder At</th>
                      <th scope="col" className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.lowStockProducts.slice(0, 5).map((item) => {
                      const thumbSrc = item.images?.[0];
                      return (
                        <tr key={item.id} className="product-row-low-stock">
                          <td>
                            {thumbSrc ? (
                              <img
                                src={thumbSrc}
                                alt={item.title}
                                style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid #E2E8F0', display: 'block' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: '#F1F5F9' }} />
                            )}
                          </td>
                          <td>
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-xs text-muted">SKU: {item.sku}</div>
                          </td>
                          <td className="text-right font-bold text-amber">
                            {item.available} {item.unit}
                          </td>
                          <td className="text-right text-muted">
                            {item.reorderLevel} {item.unit}
                          </td>
                          <td className="text-right">
                            <button
                              type="button"
                              className="btn btn-secondary btn-xs"
                              disabled={!canWrite}
                              title={!canWrite ? 'Available after verification' : 'Adjust stock'}
                              onClick={() =>
                                setAdjustTarget({
                                  product: item,
                                  stockLevel: { onHand: item.onHand, reserved: item.reserved },
                                })
                              }
                            >
                              <SlidersHorizontal size={12} />
                              <span>Adjust</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Stock Movements */}
          <div className="inv-section-card">
            <div className="inv-section-header">
              <h3>Recent Stock Movements</h3>
              <Link to="/seller/inventory/movements" className="text-sm font-semibold text-primary">
                Full Ledger
              </Link>
            </div>

            <MovementTable
              movements={overview?.recentMovements || []}
              showProductColumn={true}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Modal for stock adjustment */}
        {adjustTarget && (
          <StockAdjustModal
            isOpen={true}
            product={adjustTarget.product}
            stockLevel={adjustTarget.stockLevel}
            onClose={() => setAdjustTarget(null)}
            onSuccess={() => {
              refetch();
              setAdjustTarget(null);
            }}
          />
        )}
      </div>
    </DashboardShell>
  );
}

