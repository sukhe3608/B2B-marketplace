/* ============================================================
   TradeLink — ProductListPage (/seller/inventory/products)
   Search, filters, sort, bulk actions, inline stock quantity,
   status chips, and out-of-stock / low-stock row highlights.
   ============================================================ */
import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, Plus, Upload, SlidersHorizontal, Eye, Edit,
  Archive, Trash2, ArrowUpDown, RefreshCw, AlertCircle
} from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import VerificationBanner from '../../../components/inventory/VerificationBanner';
import StockAdjustModal from '../../../components/inventory/StockAdjustModal';
import ConfirmDialog from '../../../components/inventory/ConfirmDialog';
import StockBadge from '../../../components/shop/StockBadge';
import { useAuth, useQuery } from '../../../hooks';
import { inventoryService } from '../../../services/inventoryService';
import { inventoryQueryKeys } from '../../../features/inventory/inventoryQueryKeys';
import { SkeletonTable } from '../../../components/common';
import { mockDb } from '../../../services/mockDb';
import './inventory-pages.css';

export default function ProductListPage() {
  const { user, verificationStatus } = useAuth();
  const sellerId = user?.sellerId || 'sel-001';
  const currentSeller = mockDb.findOne('sellers', (s) => s.id === sellerId);
  const effectiveStatus = (verificationStatus && verificationStatus !== 'none')
    ? verificationStatus
    : (currentSeller?.verificationStatus || 'approved');
  const canWrite = effectiveStatus === 'verified' || effectiveStatus === 'approved';
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const statusFilter = searchParams.get('status') || '';
  const stockFilter = searchParams.get('stockStatus') || '';
  const sort = searchParams.get('sort') || 'createdAt_desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [selectedIds, setSelectedIds] = useState([]);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [bulkArchiveOpen, setBulkArchiveOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const {
    data: productData,
    isLoading,
    refetch,
  } = useQuery(
    inventoryQueryKeys.products(sellerId, { q, status: statusFilter, stockStatus: stockFilter, sort, page }),
    () => inventoryService.getSellerProducts(sellerId, { q, status: statusFilter, stockStatus: stockFilter, sort, page })
  );

  const products = productData?.products || [];
  const total = productData?.total || 0;
  const pageSize = productData?.pageSize || 15;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleArchiveSingle = async () => {
    if (!archiveTarget) return;
    setActionLoading(true);
    try {
      await inventoryService.archiveProduct(archiveTarget.id);
      setActionLoading(false);
      setArchiveTarget(null);
      refetch();
    } catch (err) {
      setActionLoading(false);
      alert('Failed to archive: ' + err.message);
    }
  };

  const handleBulkArchive = async () => {
    setActionLoading(true);
    try {
      for (const id of selectedIds) {
        await inventoryService.archiveProduct(id);
      }
      setSelectedIds([]);
      setActionLoading(false);
      setBulkArchiveOpen(false);
      refetch();
    } catch (err) {
      setActionLoading(false);
      alert('Bulk archive failed: ' + err.message);
    }
  };

  return (
    <DashboardShell role="seller">
      <div className="inv-page-container animate-fade-in-up">
        <VerificationBanner verificationStatus={effectiveStatus} />

        {/* Page Header */}
        <div className="inv-page-header">
          <div className="inv-header-title">
            <h1>Product Catalog & Stock</h1>
            <p>Manage {total} SKU listings, pricing tiers, and inventory availability.</p>
          </div>
          <div className="inv-header-actions">
            <Link
              to="/seller/inventory/import"
              className={`btn btn-secondary btn-sm ${!canWrite ? 'disabled-action' : ''}`}
            >
              <Upload size={14} />
              <span>Bulk Import CSV</span>
            </Link>
            <Link
              to="/seller/inventory/products/new"
              className={`btn btn-primary btn-sm ${!canWrite ? 'disabled-action' : ''}`}
            >
              <Plus size={14} />
              <span>New Product</span>
            </Link>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="inv-toolbar">
          <div className="toolbar-search">
            <Search size={16} className="toolbar-search-icon" />
            <input
              type="text"
              placeholder="Search by SKU, product title, or description..."
              className="toolbar-search-input"
              value={q}
              onChange={(e) => updateParam('q', e.target.value)}
            />
          </div>

          <div className="toolbar-filters">
            {/* Status Filter */}
            <select
              className="toolbar-select"
              value={statusFilter}
              onChange={(e) => updateParam('status', e.target.value)}
              aria-label="Filter by listing status"
            >
              <option value="">All Listing Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            {/* Stock Status Filter */}
            <select
              className="toolbar-select"
              value={stockFilter}
              onChange={(e) => updateParam('stockStatus', e.target.value)}
              aria-label="Filter by stock status"
            >
              <option value="">All Stock Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="made_to_order">Made to Order</option>
            </select>

            {/* Sort */}
            <select
              className="toolbar-select"
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              aria-label="Sort products"
            >
              <option value="createdAt_desc">Newest Added</option>
              <option value="createdAt_asc">Oldest Added</option>
              <option value="available_asc">Stock: Low to High</option>
              <option value="available_desc">Stock: High to Low</option>
              <option value="title_asc">Title: A-Z</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bulk-selection-bar flex items-center justify-between p-3 mb-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <span className="font-semibold text-sm text-indigo-900">
              {selectedIds.length} products selected
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-xs text-danger"
                disabled={!canWrite}
                onClick={() => setBulkArchiveOpen(true)}
              >
                <Archive size={14} />
                <span>Archive Selected</span>
              </button>
            </div>
          </div>
        )}

        {/* Product Table */}
        {isLoading ? (
          <SkeletonTable rows={8} columns={7} />
        ) : products.length === 0 ? (
          <div className="empty-state-card text-center p-8">
            <AlertCircle size={36} className="mx-auto text-muted mb-2" />
            <h3 className="font-bold text-lg mb-1">No products found</h3>
            <p className="text-muted text-sm mb-4">
              Try adjusting your search criteria or add your first product listing.
            </p>
            <Link to="/seller/inventory/products/new" className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Add Product</span>
            </Link>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className="custom-table" aria-label="Seller product list">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '38px' }}>
                    <input
                      type="checkbox"
                      aria-label="Select all products"
                      checked={selectedIds.length === products.length && products.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th scope="col">Product Details</th>
                  <th scope="col">SKU</th>
                  <th scope="col">Price Range</th>
                  <th scope="col">Stock Availability</th>
                  <th scope="col">Listing Status</th>
                  <th scope="col" className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => {
                  const isOutOfStock = item.stockStatus === 'out_of_stock';
                  const isLowStock = item.stockStatus === 'low_stock';
                  const rowClass = isOutOfStock
                    ? 'product-row-out-of-stock'
                    : isLowStock
                    ? 'product-row-low-stock'
                    : '';

                  const thumb = item.images && item.images.length > 0
                    ? item.images[0]
                    : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=60';

                  const minP = item.priceSlabs?.length ? Math.min(...item.priceSlabs.map(s => s.price)) : 0;
                  const maxP = item.priceSlabs?.length ? Math.max(...item.priceSlabs.map(s => s.price)) : 0;

                  return (
                    <tr key={item.id} className={rowClass}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${item.title}`}
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleSelectRow(item.id)}
                        />
                      </td>
                      <td>
                        <div className="table-product-cell">
                          <div className="table-cell-thumb">
                            <img src={thumb} alt="" loading="lazy" />
                          </div>
                          <div>
                            <Link
                              to={`/seller/inventory/products/${item.id}`}
                              className="font-semibold text-primary block hover:underline"
                              title={item.title}
                            >
                              {item.title}
                            </Link>
                            <span className="text-xs text-muted block">MOQ: {item.moq} {item.unit}</span>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs">{item.sku}</td>
                      <td>
                        <span className="font-semibold">
                          ₹{minP.toLocaleString('en-IN')}{minP !== maxP ? ` – ₹${maxP.toLocaleString('en-IN')}` : ''}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <StockBadge stockStatus={item.stockStatus} available={item.available} />
                          {item.trackStock && (
                            <span className="text-xs text-muted">
                              {item.available} avail / {item.onHand} on hand ({item.reserved} res)
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-chip ${
                            item.status === 'active'
                              ? 'chip-green'
                              : item.status === 'draft'
                              ? 'chip-amber'
                              : 'chip-gray'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="row-actions-group justify-end">
                          <Link
                            to={`/seller/inventory/products/${item.id}`}
                            className="icon-action-btn"
                            title="View stock history & details"
                            aria-label={`View ${item.title}`}
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            to={`/seller/inventory/products/${item.id}/edit`}
                            className={`icon-action-btn ${!canWrite ? 'disabled-action' : ''}`}
                            title={!canWrite ? 'Available after verification' : 'Edit product'}
                            aria-label={`Edit ${item.title}`}
                          >
                            <Edit size={15} />
                          </Link>
                          {item.trackStock && (
                            <button
                              type="button"
                              className="icon-action-btn"
                              disabled={!canWrite}
                              title={!canWrite ? 'Available after verification' : 'Quick adjust stock'}
                              aria-label={`Adjust stock for ${item.title}`}
                              onClick={() =>
                                setAdjustTarget({
                                  product: item,
                                  stockLevel: { onHand: item.onHand, reserved: item.reserved },
                                })
                              }
                            >
                              <SlidersHorizontal size={15} />
                            </button>
                          )}
                          {item.status !== 'archived' && (
                            <button
                              type="button"
                              className="icon-action-btn text-danger"
                              disabled={!canWrite}
                              title={!canWrite ? 'Available after verification' : 'Archive product'}
                              aria-label={`Archive ${item.title}`}
                              onClick={() => setArchiveTarget(item)}
                            >
                              <Archive size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 text-sm text-muted">
            <span>
              Showing page {page} of {totalPages} ({total} SKUs)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                disabled={page <= 1}
                onClick={() => updateParam('page', String(page - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                disabled={page >= totalPages}
                onClick={() => updateParam('page', String(page + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Adjust Stock Modal */}
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

        {/* Archive Single Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!archiveTarget}
          title="Archive Product Listing"
          message={`Are you sure you want to archive "${archiveTarget?.title}"? It will immediately disappear from the customer shop catalog.`}
          confirmLabel="Archive Listing"
          isDestructive={true}
          isLoading={actionLoading}
          onConfirm={handleArchiveSingle}
          onCancel={() => setArchiveTarget(null)}
        />

        {/* Bulk Archive Confirmation Dialog */}
        <ConfirmDialog
          isOpen={bulkArchiveOpen}
          title="Bulk Archive Products"
          message={`Are you sure you want to archive ${selectedIds.length} selected products? They will be hidden from buyers in the shop.`}
          confirmLabel="Archive Selected"
          isDestructive={true}
          isLoading={actionLoading}
          onConfirm={handleBulkArchive}
          onCancel={() => setBulkArchiveOpen(false)}
        />
      </div>
    </DashboardShell>
  );
}

