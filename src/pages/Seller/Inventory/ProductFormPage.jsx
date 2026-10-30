/* ============================================================
   TradeLink — ProductFormPage (/seller/inventory/products/new & /:id/edit)
   Multi-step wizard: Basic info → Pricing slabs → Stock & MOQ →
   Images → Review, then Publish or Save as Draft.
   ============================================================ */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Save, AlertCircle, Sparkles
} from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import VerificationBanner from '../../../components/inventory/VerificationBanner';
import SlabEditor from '../../../components/inventory/SlabEditor';
import ImageUploader from '../../../components/inventory/ImageUploader';
import { useAuth, useQuery } from '../../../hooks';
import { inventoryService } from '../../../services/inventoryService';
import { shopService } from '../../../services/shopService';
import { inventoryQueryKeys } from '../../../features/inventory/inventoryQueryKeys';
import './inventory-pages.css';

import { mockDb } from '../../../services/mockDb';

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Pricing Slabs' },
  { id: 3, label: 'Stock & Inventory' },
  { id: 4, label: 'Images' },
  { id: 5, label: 'Review & Publish' },
];

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user, verificationStatus } = useAuth();
  const sellerId = user?.sellerId || 'sel-001';
  const currentSeller = mockDb.findOne('sellers', (s) => s.id === sellerId);
  const effectiveStatus = (verificationStatus && verificationStatus !== 'none')
    ? verificationStatus
    : (currentSeller?.verificationStatus || 'approved');
  const canWrite = effectiveStatus === 'verified' || effectiveStatus === 'approved';

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sku: '',
    categoryId: 'cat-001',
    unit: 'Pieces',
    gstRate: 18,
    leadTimeDays: 3,
    trackStock: true,
    openingStock: 50,
    reorderLevel: 10,
    moq: 5,
    priceSlabs: [{ minQty: 1, price: 500 }],
    images: [],
    status: 'active',
  });

  // Fetch categories for select
  const { data: categories = [] } = useQuery(['categories'], () => shopService.getCategories());

  // If edit mode, fetch existing product
  const { data: existingProduct, isLoading: loadingProduct } = useQuery(
    inventoryQueryKeys.product(id),
    () => inventoryService.getProductById(id),
    { enabled: isEdit }
  );

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        title: existingProduct.title || '',
        description: existingProduct.description || '',
        sku: existingProduct.sku || '',
        categoryId: existingProduct.categoryId || 'cat-001',
        unit: existingProduct.unit || 'Pieces',
        gstRate: existingProduct.gstRate || 18,
        leadTimeDays: existingProduct.leadTimeDays || 3,
        trackStock: existingProduct.trackStock ?? true,
        openingStock: 0, // already in stockLevels
        reorderLevel: existingProduct.reorderLevel || 10,
        moq: existingProduct.moq || 1,
        priceSlabs: existingProduct.priceSlabs?.length ? existingProduct.priceSlabs : [{ minQty: 1, price: 500 }],
        images: existingProduct.images || [],
        status: existingProduct.status || 'active',
      });
    }
  }, [existingProduct]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step) => {
    setErrorMsg('');
    if (step === 1) {
      if (!formData.title.trim()) {
        setErrorMsg('Product title is required.');
        return false;
      }
      if (!formData.sku.trim()) {
        setErrorMsg('SKU is required.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.priceSlabs || formData.priceSlabs.length === 0) {
        setErrorMsg('At least one price tier is required.');
        return false;
      }
      for (let i = 0; i < formData.priceSlabs.length; i++) {
        const slab = formData.priceSlabs[i];
        if (slab.minQty <= 0) {
          setErrorMsg('Tier minimum quantity must be greater than 0.');
          return false;
        }
        if (slab.price <= 0) {
          setErrorMsg('Tier price must be greater than ₹0.');
          return false;
        }
        if (i > 0 && slab.minQty <= formData.priceSlabs[i - 1].minQty) {
          setErrorMsg('Tier minimum quantities must strictly increase.');
          return false;
        }
      }
    } else if (step === 3) {
      if (formData.moq <= 0) {
        setErrorMsg('Minimum Order Quantity (MOQ) must be at least 1.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
    }
  };

  const handlePrev = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSave = async (targetStatus) => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        ...formData,
        status: targetStatus,
      };

      if (isEdit) {
        await inventoryService.updateProduct(id, payload);
      } else {
        await inventoryService.createProduct(sellerId, payload);
      }

      setSubmitting(false);
      navigate('/seller/inventory/products');
    } catch (err) {
      setSubmitting(false);
      setErrorMsg(err.message || 'Failed to save product.');
    }
  };

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

        <div className="inv-page-header">
          <div className="inv-header-title">
            <h1>{isEdit ? `Edit: ${formData.title || 'Product'}` : 'Create New Product Listing'}</h1>
            <p>Define product specifications, tiered wholesale price slabs, and inventory policy.</p>
          </div>
        </div>

        {/* Wizard Stepper Navigation */}
        <div className="wizard-stepper-bar">
          {STEPS.map((s) => {
            const isActive = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            return (
              <button
                key={s.id}
                type="button"
                className={`wizard-step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  if (s.id < currentStep || validateStep(currentStep)) {
                    setCurrentStep(s.id);
                  }
                }}
              >
                <div className="step-number">{isCompleted ? <Check size={12} strokeWidth={3} /> : s.id}</div>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="form-error-banner mb-4" role="alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Wizard Step Content */}
        <div className="wizard-card">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div>
              <h3 className="font-bold text-lg mb-4">Step 1: Basic Specifications</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="prod-title">Product Title *</label>
                <input
                  id="prod-title"
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Industrial Heavy-Duty Submersible Water Pump 5HP"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-sku">Stock Keeping Unit (SKU) *</label>
                  <input
                    id="prod-sku"
                    type="text"
                    required
                    className="form-input font-mono"
                    placeholder="e.g. PMP-IND-5HP-01"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-cat">Category *</label>
                  <select
                    id="prod-cat"
                    className="form-input"
                    value={formData.categoryId}
                    onChange={(e) => handleChange('categoryId', e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-unit">Sales Unit</label>
                  <input
                    id="prod-unit"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Pieces, Boxes, Kg, Meters"
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-gst">GST Rate (%)</label>
                  <select
                    id="prod-gst"
                    className="form-input"
                    value={formData.gstRate}
                    onChange={(e) => handleChange('gstRate', Number(e.target.value))}
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18% (Standard Industrial)</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-lead">Lead Time (Days)</label>
                  <input
                    id="prod-lead"
                    type="number"
                    min="1"
                    className="form-input"
                    value={formData.leadTimeDays}
                    onChange={(e) => handleChange('leadTimeDays', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-desc">Product Description & Technical Specs</label>
                <textarea
                  id="prod-desc"
                  rows="4"
                  className="form-textarea"
                  placeholder="Describe materials, manufacturing standards, certifications, and compliance..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Pricing Slabs */}
          {currentStep === 2 && (
            <div>
              <h3 className="font-bold text-lg mb-4">Step 2: Tiered Wholesale Price Slabs</h3>
              <SlabEditor
                slabs={formData.priceSlabs}
                onChange={(slabs) => handleChange('priceSlabs', slabs)}
              />
            </div>
          )}

          {/* Step 3: Stock & Inventory */}
          {currentStep === 3 && (
            <div>
              <h3 className="font-bold text-lg mb-4">Step 3: Inventory Controls</h3>
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4">
                <input
                  type="checkbox"
                  id="track-stock-toggle"
                  checked={formData.trackStock}
                  onChange={(e) => handleChange('trackStock', e.target.checked)}
                />
                <label htmlFor="track-stock-toggle" className="font-semibold text-sm cursor-pointer">
                  Track Physical Warehouse Inventory
                </label>
                <span className="text-xs text-muted">
                  (Uncheck for Made to Order / Custom Manufacture products)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-moq">Minimum Order Qty (MOQ) *</label>
                  <input
                    id="prod-moq"
                    type="number"
                    min="1"
                    required
                    className="form-input"
                    value={formData.moq}
                    onChange={(e) => handleChange('moq', Number(e.target.value))}
                  />
                  <span className="text-xs text-muted">Buyers cannot order less than this amount.</span>
                </div>

                {formData.trackStock && !isEdit && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-opening">Initial Opening Stock (Units)</label>
                    <input
                      id="prod-opening"
                      type="number"
                      min="0"
                      className="form-input"
                      value={formData.openingStock}
                      onChange={(e) => handleChange('openingStock', Number(e.target.value))}
                    />
                    <span className="text-xs text-muted">Logs an initial restock movement.</span>
                  </div>
                )}

                {formData.trackStock && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="prod-reorder">Low Stock Alert Level</label>
                    <input
                      id="prod-reorder"
                      type="number"
                      min="0"
                      className="form-input"
                      value={formData.reorderLevel}
                      onChange={(e) => handleChange('reorderLevel', Number(e.target.value))}
                    />
                    <span className="text-xs text-muted">Triggers low-stock warning threshold.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Images */}
          {currentStep === 4 && (
            <div>
              <h3 className="font-bold text-lg mb-4">Step 4: Product Media Gallery</h3>
              <ImageUploader
                images={formData.images}
                onChange={(images) => handleChange('images', images)}
              />
            </div>
          )}

          {/* Step 5: Review & Publish */}
          {currentStep === 5 && (
            <div>
              <h3 className="font-bold text-lg mb-4">Step 5: Review Listing Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <h4 className="font-bold text-base mb-2">{formData.title || 'Untitled'}</h4>
                  <p className="text-xs text-muted font-mono mb-2">SKU: {formData.sku}</p>
                  <p className="text-sm mb-2">{formData.description || 'No description provided.'}</p>
                  <p className="text-xs text-muted">MOQ: {formData.moq} {formData.unit} | GST: {formData.gstRate}% | Lead: {formData.leadTimeDays} days</p>
                </div>
                <div>
                  <h5 className="font-semibold text-xs text-muted uppercase tracking-wider mb-2">Pricing Slabs:</h5>
                  <ul className="text-sm space-y-1 mb-3">
                    {formData.priceSlabs.map((s, idx) => (
                      <li key={idx} className="flex justify-between border-b pb-1">
                        <span>{s.minQty}+ {formData.unit}</span>
                        <span className="font-semibold">₹{Number(s.price).toLocaleString('en-IN')}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted">
                    Inventory Policy: {formData.trackStock ? `Tracked (Alert at ${formData.reorderLevel} ${formData.unit})` : 'Made to Order'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Navigation Footer */}
          <div className="wizard-footer-actions">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handlePrev}
                >
                  <ArrowLeft size={14} />
                  <span>Previous Step</span>
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleNext}
                >
                  <span>Next Step</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={submitting || !canWrite}
                    onClick={() => handleSave('draft')}
                    title={!canWrite ? 'Available after verification' : undefined}
                  >
                    <Save size={14} />
                    <span>Save as Draft</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={submitting || !canWrite}
                    onClick={() => handleSave('active')}
                    title={!canWrite ? 'Available after verification' : undefined}
                  >
                    <Check size={14} />
                    <span>Publish Listing</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

