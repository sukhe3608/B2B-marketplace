/* ============================================================
   TradeLink — Seller Products Catalog Management Page
   Listings, stock levels, add new product modal, and pricing.
   ============================================================ */
import { useState } from 'react';
import {
  Package, Plus, Search, Filter, Edit3, Trash2, CheckCircle2,
  AlertCircle, Eye, MessageSquare, DollarSign, X, Tag
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import { CATEGORIES, MOCK_SELLER_PRODUCTS } from '../../utils/constants';
import './SellerPages.css';

export default function SellerProducts() {
  const [products, setProducts] = useState(MOCK_SELLER_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  // New Product Form
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0].label,
    price: '',
    stock: 'In Stock',
    moq: '10 Units',
  });

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const newProduct = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      category: formData.category,
      price: formData.price.startsWith('₹') ? formData.price : `₹${formData.price}`,
      stock: formData.stock,
      views: 0,
      inquiries: 0,
      image: null,
    };

    setProducts([newProduct, ...products]);
    setFormData({ name: '', category: CATEGORIES[0].label, price: '', stock: 'In Stock', moq: '10 Units' });
    setModalOpen(false);
  };

  const handleDeleteProduct = (id) => {
    if (confirm('Are you sure you want to remove this product from your catalog?')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <DashboardShell role="seller">
      <div className="subpage-container animate-fade-in-up">
        {/* Header */}
        <div className="subpage-header">
          <div>
            <h1 className="subpage-title">Product Catalog & Inventory</h1>
            <p className="subpage-subtitle">Showcase your products to millions of verified buyers across India.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={18} /> Add New Product
          </button>
        </div>

        {/* Filter Controls */}
        <div className="subpage-filter-bar">
          <div className="filter-search-box">
            <Search size={18} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search by product name, SKU..."
              className="filter-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="subpage-tabs">
            {['All', 'Machinery', 'Electronics', 'Industrial Tools'].map((cat) => (
              <button
                key={cat}
                className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="card table-container-card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock Status</th>
                  <th>Buyer Views</th>
                  <th>Inquiries</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="table-product-cell">
                          <div className="table-product-thumb">
                            <Package size={20} />
                          </div>
                          <div>
                            <div className="table-product-name">{p.name}</div>
                            <span className="table-product-sku">SKU: {p.id.toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{p.category}</span>
                      </td>
                      <td>
                        <strong className="table-price">{p.price}</strong>
                      </td>
                      <td>
                        <span className={`badge ${p.stock === 'In Stock' ? 'badge-success' : 'badge-warning'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td>
                        <div className="table-metric-cell">
                          <Eye size={14} /> {p.views}
                        </div>
                      </td>
                      <td>
                        <div className="table-metric-cell">
                          <MessageSquare size={14} /> {p.inquiries}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions-cell">
                          <button className="btn btn-ghost btn-icon btn-sm" title="Edit Product">
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon btn-sm text-error"
                            title="Delete Product"
                            onClick={() => handleDeleteProduct(p.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6">
                      No products found. Click "Add New Product" to list your first item.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Product Modal */}
        {modalOpen && (
          <div className="modal-backdrop animate-fade-in" onClick={() => setModalOpen(false)}>
            <div className="modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">List a New Product</h2>
                  <p className="modal-subtitle">Add technical details and pricing to receive buyer orders.</p>
                </div>
                <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Heavy Duty Hydraulic Cylinders 100mm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.label}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price per Unit (₹) *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 2,400"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Minimum Order Quantity (MOQ)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.moq}
                      onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Status</label>
                    <select
                      className="form-select"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Made to Order">Made to Order</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Publish Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
