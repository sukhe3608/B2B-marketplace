/* ============================================================
   TradeLink — ShopListingPage (/consumer/shop)
   B2B marketplace listing with category tree, price & city filters,
   verified-only toggle, sorting, pagination, and product grid.
   ============================================================ */
import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, SlidersHorizontal, ArrowUpDown, X, Filter, ShoppingBag
} from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import CategoryTree from '../../../components/shop/CategoryTree';
import ProductCard from '../../../components/shop/ProductCard';
import { SkeletonCard } from '../../../components/common';
import { useQuery } from '../../../hooks';
import { shopService } from '../../../services/shopService';
import { shopQueryKeys } from '../../../features/shop/shopQueryKeys';
import { addLine } from '../../../store/cartSlice';
import { addItem as addWishlist, removeItem as removeWishlist, selectWishlistItems } from '../../../store/wishlistSlice';
import './shop-pages.css';

export default function ShopListingPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from URL
  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const availability = searchParams.get('availability') || '';
  const city = searchParams.get('city') || '';
  const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
  const sort = searchParams.get('sort') || 'featured';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Redux Wishlist items
  const wishlistItems = useSelector(selectWishlistItems);
  const wishlistedMap = useMemo(() => {
    const map = {};
    wishlistItems.forEach((w) => {
      map[w.productId] = true;
    });
    return map;
  }, [wishlistItems]);

  // Fetch categories
  const { data: categories = [] } = useQuery(
    shopQueryKeys.categories(),
    () => shopService.getCategories()
  );

  // Fetch verified cities / sellers for city filter
  const { data: sellers = [] } = useQuery(
    shopQueryKeys.sellers(),
    () => shopService.getSellers()
  );

  const availableCities = useMemo(() => {
    const set = new Set();
    sellers.forEach((s) => {
      if (s.city) set.add(s.city);
    });
    return Array.from(set);
  }, [sellers]);

  // Fetch products with active filters
  const {
    data: productData,
    isLoading,
    refetch,
  } = useQuery(
    shopQueryKeys.products({ q, categoryId, minPrice, maxPrice, availability, city, verifiedOnly, sort, page }),
    () => shopService.getProducts({ q, categoryId, minPrice, maxPrice, availability, city, verifiedOnly, sort, page })
  );

  const products = productData?.products || [];
  const total = productData?.total || 0;
  const pageSize = productData?.pageSize || 12;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val !== undefined && val !== null && val !== '') {
      next.set(key, String(val));
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleToggleWishlist = (product) => {
    const isW = wishlistedMap[product.id];
    if (isW) {
      dispatch(removeWishlist(product.id));
    } else {
      dispatch(
        addWishlist({
          productId: product.id,
          title: product.title,
          sku: product.sku,
          image: product.images?.[0] || '',
          price: product.priceSlabs?.[0]?.price || 0,
        })
      );
    }
  };

  const handleQuickAdd = (product) => {
    const baseSlab = product.priceSlabs?.[0];
    const initialQty = product.moq || 1;
    dispatch(
      addLine({
        productId: product.id,
        sellerId: product.sellerId,
        sellerName: product.seller?.name || 'TradeLink Supplier',
        title: product.title,
        sku: product.sku,
        images: product.images || [],
        moq: product.moq || 1,
        unit: product.unit || 'pcs',
        gstRate: product.gstRate || 18,
        priceSlabs: product.priceSlabs || [],
        qty: initialQty,
        available: product.available || 999,
        trackStock: product.trackStock,
      })
    );
  };

  return (
    <DashboardShell role="consumer">
      <div className="shop-page-container animate-fade-in-up">
        {/* Search & Mobile Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="toolbar-search w-full sm:max-w-md">
            <Search size={16} className="toolbar-search-icon" />
            <input
              type="text"
              placeholder="Search products, materials, machinery, SKUs..."
              className="toolbar-search-input"
              value={q}
              onChange={(e) => updateParam('q', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
            <button
              type="button"
              className="btn btn-secondary btn-sm lg:hidden inline-flex items-center gap-1"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            >
              <Filter size={14} />
              <span>Filters</span>
            </button>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-muted" />
              <select
                className="toolbar-select text-xs"
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                aria-label="Sort products"
              >
                <option value="featured">Featured Catalog</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="moq_asc">MOQ: Low to High</option>
                <option value="lead_asc">Fastest Lead Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2-Column Listing Layout */}
        <div className="shop-listing-layout">
          {/* Left Sidebar: Filters & Category Tree */}
          <aside className={`shop-sidebar ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            {/* Category Tree Navigation */}
            <CategoryTree
              categories={categories}
              selectedCategoryId={categoryId}
              onSelectCategory={(catId) => updateParam('categoryId', catId)}
            />

            {/* Availability Filter */}
            <div className="shop-filter-panel">
              <h4 className="shop-filter-title">Stock Status</h4>
              <label className="filter-checkbox-label">
                <input
                  type="radio"
                  name="avail-filter"
                  checked={!availability}
                  onChange={() => updateParam('availability', '')}
                />
                <span>All Listings</span>
              </label>
              <label className="filter-checkbox-label">
                <input
                  type="radio"
                  name="avail-filter"
                  checked={availability === 'in_stock'}
                  onChange={() => updateParam('availability', 'in_stock')}
                />
                <span>In Stock Only</span>
              </label>
              <label className="filter-checkbox-label">
                <input
                  type="radio"
                  name="avail-filter"
                  checked={availability === 'made_to_order'}
                  onChange={() => updateParam('availability', 'made_to_order')}
                />
                <span>Made to Order</span>
              </label>
            </div>

            {/* Verified Seller Toggle */}
            <div className="shop-filter-panel">
              <h4 className="shop-filter-title">Supplier Trust</h4>
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => updateParam('verifiedOnly', e.target.checked ? 'true' : '')}
                />
                <span className="font-semibold text-primary">Verified Suppliers Only</span>
              </label>
            </div>

            {/* Supplier City Filter */}
            {availableCities.length > 0 && (
              <div className="shop-filter-panel">
                <h4 className="shop-filter-title">Supplier City</h4>
                <select
                  className="toolbar-select w-full"
                  value={city}
                  onChange={(e) => updateParam('city', e.target.value)}
                  aria-label="Filter by supplier city"
                >
                  <option value="">All Cities</option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Filter */}
            <div className="shop-filter-panel">
              <h4 className="shop-filter-title">Price Range (₹)</h4>
              <div className="filter-price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  className="form-input text-xs"
                  value={minPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="form-input text-xs"
                  value={maxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                />
              </div>
            </div>
          </aside>

          {/* Right Main Area: Products Grid & Pagination */}
          <main className="shop-main-content">
            {/* Results Counter Bar */}
            <div className="shop-results-bar">
              <span className="text-xs font-semibold text-muted">
                Showing {products.length} of {total} verified wholesale listings
              </span>
              {(categoryId || availability || city || verifiedOnly || minPrice || maxPrice || q) && (
                <button
                  type="button"
                  className="text-xs text-danger inline-flex items-center gap-1 hover:underline self-start sm:self-auto"
                  onClick={() => setSearchParams(new URLSearchParams())}
                >
                  <X size={12} />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="shop-grid">
                <SkeletonCard count={6} />
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state-card text-center p-12">
                <ShoppingBag size={44} className="mx-auto text-muted mb-3" />
                <h3 className="font-bold text-lg mb-1">No products match your criteria</h3>
                <p className="text-muted text-sm mb-4">
                  Try clearing some filters or searching for alternative industrial components.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSearchParams(new URLSearchParams())}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="shop-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={!!wishlistedMap[product.id]}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={handleQuickAdd}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 text-sm text-muted">
                <span>Page {page} of {totalPages}</span>
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
          </main>
        </div>
      </div>
    </DashboardShell>
  );
}

