/* ============================================================
   TradeLink — Seller Details Page (Screen 6)
   Multi-step KYC form: Business Info → Legal → Category → Docs
   ============================================================ */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowRight, ArrowLeft, Upload, FileText, CheckCircle2, X, Building2, ClipboardCheck, Package } from 'lucide-react';
import { useAuth } from '../../hooks';
import useOnboardingStore from '../../store/onboardingStore';
import CategoryIcon from '../../components/common/CategoryIcon';
import { BUSINESS_TYPES, INDIAN_STATES, CATEGORIES } from '../../utils/constants';
import { validateGST, validatePAN, validateFile } from '../../utils/validators';
import './Onboarding.css';

const STEPS = [
  { id: 0, label: 'Business Information', icon: Building2 },
  { id: 1, label: 'GST & PAN Verification', icon: ClipboardCheck },
  { id: 2, label: 'Category & Catalog', icon: Package },
  { id: 3, label: 'Upload Documents', icon: FileText },
];

export default function SellerDetailsPage() {
  const navigate = useNavigate();
  const { updateProfile, completeOnboarding, setVerificationStatus } = useAuth();
  const store = useOnboardingStore();
  const [currentStep, setCurrentStep] = useState(store.currentStep);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateStep = () => {
    const errs = {};
    if (currentStep === 0) {
      if (!store.businessInfo.companyName) errs.companyName = 'Company name is required';
      if (!store.businessInfo.businessType) errs.businessType = 'Select a business type';
    }
    if (currentStep === 1) {
      if (!store.legalInfo.gstNumber) errs.gstNumber = 'GST number is required';
      else {
        const gstResult = validateGST(store.legalInfo.gstNumber);
        if (!gstResult.valid) errs.gstNumber = gstResult.message;
      }
      if (!store.legalInfo.panNumber) errs.panNumber = 'PAN number is required';
      else {
        const panResult = validatePAN(store.legalInfo.panNumber);
        if (!panResult.valid) errs.panNumber = panResult.message;
      }
      if (!store.legalInfo.businessAddress) errs.businessAddress = 'Address is required';
      if (!store.legalInfo.state) errs.state = 'Select a state';
      if (!store.legalInfo.city) errs.city = 'City is required';
    }
    if (currentStep === 2) {
      if (!store.categoryInfo.primaryCategory) errs.primaryCategory = 'Select a category';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < 3) {
      const next = currentStep + 1;
      setCurrentStep(next);
      store.setCurrentStep(next);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      store.setCurrentStep(prev);
    }
  };

  const handleFileUpload = (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = validateFile(file);
    if (!result.valid) {
      setErrors((prev) => ({ ...prev, [field]: result.errors[0] }));
      return;
    }
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    store.updateDocuments({ [field]: { name: file.name, size: file.size, type: file.type } });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    updateProfile({
      companyName: store.businessInfo.companyName,
      businessType: store.businessInfo.businessType,
      gstNumber: store.legalInfo.gstNumber,
    });
    setVerificationStatus('pending');
    completeOnboarding();
    navigate('/seller/verification');
    setIsLoading(false);
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-header">
        <div className="onboarding-logo">
          <div className="onboarding-logo-icon"><Store size={20} /></div>
          <span>TradeLink</span>
        </div>
      </div>

      <div className="onboarding-content animate-fade-in-up" style={{ maxWidth: 960 }}>
        <div className="seller-details-layout">
          {/* Step sidebar */}
          <div className="seller-steps-sidebar">
            <div className="seller-steps-sidebar-title">Registration Steps</div>
            {STEPS.map((step) => (
              <div key={step.id} className={`seller-step-item ${currentStep === step.id ? 'active' : currentStep > step.id ? 'completed' : ''}`}>
                <div className="seller-step-num">
                  {currentStep > step.id ? <CheckCircle2 size={14} /> : step.id + 1}
                </div>
                <span>{step.label}</span>
              </div>
            ))}

            <div className="seller-brand-card">
              <h3>Build Your Business with Us</h3>
              <p>Register as a verified seller to reach millions of buyers.</p>
            </div>
          </div>

          {/* Form area */}
          <div className="seller-form-card">
            {/* Step 0: Business Info */}
            {currentStep === 0 && (
              <>
                <h2 className="seller-form-title">Business Information</h2>
                <p className="seller-form-subtitle">Tell us about your business</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Business / Company Name <span className="required">*</span></label>
                    <input className={`form-input ${errors.companyName ? 'error' : ''}`} placeholder="Enter company name"
                      value={store.businessInfo.companyName}
                      onChange={(e) => store.updateBusinessInfo({ companyName: e.target.value })} />
                    {errors.companyName && <span className="form-error">{errors.companyName}</span>}
                  </div>
                  <div className="seller-form-grid">
                    <div className="form-group">
                      <label className="form-label">Business Category <span className="required">*</span></label>
                      <select className={`form-input form-select ${errors.businessType ? 'error' : ''}`}
                        value={store.businessInfo.businessType}
                        onChange={(e) => store.updateBusinessInfo({ businessType: e.target.value })}>
                        <option value="">Select type</option>
                        {BUSINESS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      {errors.businessType && <span className="form-error">{errors.businessType}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Business Type</label>
                      <select className="form-input form-select"
                        value={store.businessInfo.yearEstablished}
                        onChange={(e) => store.updateBusinessInfo({ yearEstablished: e.target.value })}>
                        <option value="">Select type</option>
                        <option value="private">Private Limited</option>
                        <option value="partnership">Partnership</option>
                        <option value="proprietorship">Proprietorship</option>
                        <option value="llp">LLP</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 1: Legal / KYC */}
            {currentStep === 1 && (
              <>
                <h2 className="seller-form-title">GST & PAN Verification</h2>
                <p className="seller-form-subtitle">Required for seller verification</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div className="seller-form-grid">
                    <div className="form-group">
                      <label className="form-label">GST Number <span className="required">*</span></label>
                      <input className={`form-input ${errors.gstNumber ? 'error' : ''}`} placeholder="22AAAAA0000A1Z5"
                        value={store.legalInfo.gstNumber} maxLength={15}
                        onChange={(e) => store.updateLegalInfo({ gstNumber: e.target.value.toUpperCase() })} />
                      {errors.gstNumber && <span className="form-error">{errors.gstNumber}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">PAN Number <span className="required">*</span></label>
                      <input className={`form-input ${errors.panNumber ? 'error' : ''}`} placeholder="ABCDE1234F"
                        value={store.legalInfo.panNumber} maxLength={10}
                        onChange={(e) => store.updateLegalInfo({ panNumber: e.target.value.toUpperCase() })} />
                      {errors.panNumber && <span className="form-error">{errors.panNumber}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Business Address <span className="required">*</span></label>
                    <input className={`form-input ${errors.businessAddress ? 'error' : ''}`} placeholder="Full address"
                      value={store.legalInfo.businessAddress}
                      onChange={(e) => store.updateLegalInfo({ businessAddress: e.target.value })} />
                    {errors.businessAddress && <span className="form-error">{errors.businessAddress}</span>}
                  </div>
                  <div className="seller-form-grid">
                    <div className="form-group">
                      <label className="form-label">State <span className="required">*</span></label>
                      <select className={`form-input form-select ${errors.state ? 'error' : ''}`}
                        value={store.legalInfo.state}
                        onChange={(e) => store.updateLegalInfo({ state: e.target.value })}>
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.state && <span className="form-error">{errors.state}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">City <span className="required">*</span></label>
                      <input className={`form-input ${errors.city ? 'error' : ''}`} placeholder="City"
                        value={store.legalInfo.city}
                        onChange={(e) => store.updateLegalInfo({ city: e.target.value })} />
                      {errors.city && <span className="form-error">{errors.city}</span>}
                    </div>
                  </div>
                  <div className="seller-form-grid">
                    <div className="form-group">
                      <label className="form-label">Seller / Company Type</label>
                      <select className="form-input form-select"
                        value={store.legalInfo.sellerType}
                        onChange={(e) => store.updateLegalInfo({ sellerType: e.target.value })}>
                        <option value="">Select type</option>
                        {BUSINESS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input className="form-input" placeholder="6-digit pincode" maxLength={6}
                        value={store.legalInfo.pincode}
                        onChange={(e) => store.updateLegalInfo({ pincode: e.target.value.replace(/\D/g, '') })} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Category */}
            {currentStep === 2 && (
              <>
                <h2 className="seller-form-title">Category & Catalog</h2>
                <p className="seller-form-subtitle">What do you sell?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Primary Business Category <span className="required">*</span></label>
                    <select className={`form-input form-select ${errors.primaryCategory ? 'error' : ''}`}
                      value={store.categoryInfo.primaryCategory}
                      onChange={(e) => store.updateCategoryInfo({ primaryCategory: e.target.value })}>
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    {errors.primaryCategory && <span className="form-error">{errors.primaryCategory}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sub-categories (up to 3)</label>
                    <div className="interest-chips">
                      {CATEGORIES.slice(0, 8).map((c) => (
                        <button key={c.id} type="button"
                          className={`tag ${store.categoryInfo.subCategories.includes(c.id) ? 'tag-selected' : ''}`}
                          onClick={() => {
                            const subs = store.categoryInfo.subCategories;
                            if (subs.includes(c.id)) store.updateCategoryInfo({ subCategories: subs.filter((s) => s !== c.id) });
                            else if (subs.length < 3) store.updateCategoryInfo({ subCategories: [...subs, c.id] });
                          }}>
                          <CategoryIcon id={c.id} size={15} />
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <>
                <h2 className="seller-form-title">Upload Documents (KYC)</h2>
                <p className="seller-form-subtitle">Upload documents for verification (PDF, JPG, PNG — max 5MB each)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  {[
                    { key: 'gstCertificate', label: 'GST Certificate' },
                    { key: 'panCard', label: 'PAN Card' },
                    { key: 'businessRegistration', label: 'Business Registration' },
                    { key: 'addressProof', label: 'Address Proof' },
                  ].map((doc) => (
                    <div key={doc.key} className="form-group">
                      <label className="form-label">{doc.label}</label>
                      {store.documents[doc.key] ? (
                        <div className="file-preview">
                          <FileText size={20} className="file-preview-icon" />
                          <div className="file-preview-info">
                            <div className="file-preview-name">{store.documents[doc.key].name}</div>
                            <div className="file-preview-size">{(store.documents[doc.key].size / 1024).toFixed(0)} KB</div>
                          </div>
                          <button className="btn btn-icon" onClick={() => store.updateDocuments({ [doc.key]: null })}><X size={16} /></button>
                        </div>
                      ) : (
                        <label className="file-uploader" style={{ padding: 'var(--space-5)' }}>
                          <Upload size={24} className="file-uploader-icon" />
                          <div className="file-uploader-text"><strong>Click to upload</strong></div>
                          <div className="file-uploader-hint">PDF, JPG, PNG (max 5MB)</div>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={(e) => handleFileUpload(doc.key, e)} />
                        </label>
                      )}
                      {errors[doc.key] && <span className="form-error">{errors[doc.key]}</span>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="seller-form-actions">
              <button className="btn btn-secondary btn-md" onClick={handleBack}
                style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}>
                <ArrowLeft size={16} /> Back
              </button>
              {currentStep < 3 ? (
                <button className="btn btn-primary btn-md" onClick={handleNext} id="seller-next-btn">
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={isLoading} id="seller-submit-btn">
                  {isLoading ? <><span className="btn-spinner"></span> Submitting...</> : <>Submit for Verification <ArrowRight size={18} /></>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
