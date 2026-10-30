/* ============================================================
   TradeLink — Seller ProductDetailPage (/seller/inventory/products/:id)
   Stock summary, stock adjustment trigger, full movement ledger,
   edit and archive controls.
   ============================================================ */
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, Archive, SlidersHorizontal, RefreshCw, AlertCircle,
  Package, DollarSign, Clock, ShieldCheck
} from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import VerificationBanner from '../../../components/inventory/VerificationBanner';
import StockAdjustModal from '../../../components/inventory/StockAdjustModal';
import MovementTable from '../../../components/inventory/MovementTable';
import ConfirmDialog from '../../../components/inventory/ConfirmDialog';
import StockBadge from '../../../components/shop/StockBadge';
import { useAuth, useQuery } from '../../../hooks';
import { inventoryService } from '../../../services/inventoryService';
import { inventoryQueryKeys } from '../../../features/inventory/inventoryQueryKeys';
import { mockDb } from '../../../services/mockDb';
import './inventory-pages.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, verificationStatus } = useAuth();
  const sellerId = user?.sellerId || 'sel-001';
  const currentSeller = mockDb.findOne('sellers', (s) => s.id === sellerId);
  const effectiveStatus = (verificationStatus && verificationStatus !== 'none')
    ? verificationStatus
    : (currentSeller?.verificationStatus || 'approved');
  const canWrite = effectiveStatus === 'verified' || effectiveStatus === 'approved';

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const {
    data: product,
    isLoading: loadingProduct,
    refetch: refetchProduct,
  } = useQuery(inventoryQueryKeys.product(id), () => inventoryService.getProductById(id));

  const {
    data: stockLevel,
    isLoading: loadingStock,
    refetch: refetchStock,
  } = useQuery(inventoryQueryKeys.stockLevel(id), () => inventoryService.getStockLevel(id));

  const {
    data: movements = [],
    isLoading: loadingMovements,
    refetch: refetchMovements,
  } = useQuery(['movements', id], () => inventoryService.getMovements(sellerId, { productId: id }));

  const refetchAll = () => {
    refetchProduct();
    refetchStock();
    refetchMovements();
  };

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      await inventoryService.archiveProduct(id);
      setActionLoading(false);
      setArchiveOpen(false);
      navigate('/seller/inventory/products');
    } catch (err) {
      setActionLoading(false);
      alert('Failed to archive: ' + err.message);
    }
  };

  if (loadingProduct) {
    return (
      <DashboardShell role="seller">
        <div className="inv-page-container p-6">
          <p className="text-muted">Loading product specifications...</p>
        </div>
      </DashboardShell>
    );
  }

  if (!product) {
    return (
      <DashboardShell role="seller">
        <div className="inv-page-container text-center p-8">
          <AlertCircle size={40} className="mx-auto text-danger mb-2" />
          <h2 className="font-bold text-lg">Product Not Found</h2>
          <p className="text-muted text-sm mb-4">This SKU does not exist in your seller inventory.</p>
          <Link to="/seller/inventory/products" className="btn btn-secondary btn-sm">
            Back to Products
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const onHand = stockLevel?.onHand ?? 0;
  const reserved = stockLevel?.reserved ?? 0;
  const available = onHand - reserved;

  return (
    <DashboardShell role="seller">
      <div className="inv-page-container animate-fade-in-up">
        <VerificationBanner verificationStatus={effectiveStatus} />

        <div className="mb-4">
          <Link to="/seller/inventory/products" className="text-sm text-muted inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft size={14} />
            <span>Back to Products</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="inv-page-header">
          <div className="inv-header-title">
            <div className="flex items-center gap-3">
              <h1>{product.title}</h1>
              <StockBadge stockStatus={product.stockStatus} available={available} />
            </div>
            <p>SKU: <span className="font-mono">{product.sku}</span> | Status: <span className="capitalize font-semibold">{product.status}</span></p>
          </div>

          <div className="inv-header-actions">
            {product.trackStock && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!canWrite}
                title={!canWrite ? 'Available after verification' : 'Adjust physical inventory'}
                onClick={() => setAdjustOpen(true)}
              >
                <SlidersHorizontal size={14} />
                <span>Adjust Stock</span>
              </button>
            )}
            <Link
              to={`/seller/inventory/products/${id}/edit`}
              className={`btn btn-secondary btn-sm ${!canWrite ? 'disabled-action' : ''}`}
            >
              <Edit size={14} />
              <span>Edit Details</span>
            </Link>
            {product.status !== 'archived' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm text-danger"
                disabled={!canWrite}
                onClick={() => setArchiveOpen(true)}
              >
                <Archive size={14} />
                <span>Archive</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Image Gallery */}
        {product.images && product.images.length > 0 && (
          <div className="inv-section-card mb-6">
            <div className="inv-section-header">
              <h3>Product Gallery</h3>
              <span className="text-xs text-muted">{product.images.length} images</span>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.title} ${idx + 1}`}
                  style={{
                    width: 180, height: 140, objectFit: 'cover',
                    borderRadius: 8, flexShrink: 0,
                    border: idx === 0 ? '2px solid var(--color-primary, #4F46E5)' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stock Metrics Card */}
        {product.trackStock ? (
          <div className="kpi-grid mb-6">
            <div className="kpi-card">
              <span className="kpi-label">Physical On Hand</span>
              <div className="kpi-value">{onHand} {product.unit}</div>
              <span className="kpi-sub">Total warehouse units</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Reserved (Open Orders)</span>
              <div className="kpi-value text-amber">{reserved} {product.unit}</div>
              <span className="kpi-sub">Locked by unfulfilled orders</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Available for Sale</span>
              <div className="kpi-value text-green">{available} {product.unit}</div>
              <span className="kpi-sub">On Hand minus Reserved</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Reorder Alert Level</span>
              <div className="kpi-value">{product.reorderLevel} {product.unit}</div>
              <span className="kpi-sub">Triggers low-stock notice</span>
            </div>
          </div>
        ) : (
          <div className="verification-banner banner-info mb-6" role="status">
            <div className="banner-icon"><Clock size={20} /></div>
            <div className="banner-content">
              <strong>Made to Order Product</strong>
              <p>Physical inventory tracking is turned off. Orders are manufactured on demand with lead time {product.leadTimeDays || 3} days.</p>
            </div>
          </div>
        )}

        {/* Product Specs & Price Slabs */}
        <div className="inv-grid-2col mb-6">
          <div className="inv-section-card">
            <div className="inv-section-header">
              <h3>Specification & Policy</h3>
            </div>
            <p className="text-sm mb-4 leading-relaxed">{product.description || 'No description provided.'}</p>
            <div className="grid grid-cols-2 gap-3 text-xs border-t pt-3">
              <div>
                <span className="text-muted block">Minimum Order Qty (MOQ):</span>
                <span className="font-bold">{product.moq} {product.unit}</span>
              </div>
              <div>
                <span className="text-muted block">Standard GST Rate:</span>
                <span className="font-bold">{product.gstRate}%</span>
              </div>
              <div>
                <span className="text-muted block">Fulfillment Lead Time:</span>
                <span className="font-bold">{product.leadTimeDays} business days</span>
              </div>
              <div>
                <span className="text-muted block">Inventory Tracking:</span>
                <span className="font-bold">{product.trackStock ? 'Enabled' : 'Disabled (Custom Build)'}</span>
              </div>
            </div>
          </div>

          <div className="inv-section-card">
            <div className="inv-section-header">
              <h3>Wholesale Volume Pricing</h3>
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th scope="col">Tier Range</th>
                  <th scope="col" className="text-right">Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {product.priceSlabs?.map((slab, i) => (
                  <tr key={i}>
                    <td>{slab.minQty}+ {product.unit}</td>
                    <td className="text-right font-bold">₹{Number(slab.price).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Movement History Table */}
        <div className="inv-section-card">
          <div className="inv-section-header">
            <h3>Audit Ledger & Movement History</h3>
            <span className="text-xs text-muted">{movements.length} logged events</span>
          </div>

          <MovementTable
            movements={movements}
            showProductColumn={false}
            isLoading={loadingMovements}
          />
        </div>

        {/* Stock Adjust Modal */}
        {adjustOpen && (
          <StockAdjustModal
            isOpen={true}
            product={product}
            stockLevel={stockLevel}
            onClose={() => setAdjustOpen(false)}
            onSuccess={() => {
              refetchAll();
              setAdjustOpen(false);
            }}
          />
        )}

        {/* Archive Confirm Dialog */}
        <ConfirmDialog
          isOpen={archiveOpen}
          title="Archive Product"
          message={`Are you sure you want to archive "${product.title}"? It will immediately disappear from the shop listing.`}
          confirmLabel="Archive"
          isDestructive={true}
          isLoading={actionLoading}
          onConfirm={handleArchive}
          onCancel={() => setArchiveOpen(false)}
        />
      </div>
    </DashboardShell>
  );
}

