/* ============================================================
   TradeLink — Consumer Details Page (Screen 4 Wireframe Match)
   Step 3 of 4: Clean form left, illustration card right.
   ============================================================ */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../hooks';
import CategoryIcon from '../../components/common/CategoryIcon';
import { CATEGORIES } from '../../utils/constants';
import consumerRecImg from '../../assets/consumer-recommendations.jpg';
import './Onboarding.css';

export default function ConsumerDetailsPage() {
  const navigate = useNavigate();
  const { updateProfile, completeOnboarding } = useAuth();
  const [interests, setInterests] = useState(['electronics', 'machinery']);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [cityPincode, setCityPincode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (id) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    updateProfile({ interests, cityPincode, companyName });
    completeOnboarding();
    navigate('/consumer/dashboard');
  };

  return (
    <div className="onboarding-page-wrapper">
      {/* Top Header Bar */}
      <header className="onboarding-top-bar">
        <Link to="/" className="role-logo-brand">
          <div className="auth-isometric-logo">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <polygon points="16,3 29,10.5 16,18 3,10.5" fill="#6366F1" />
              <polygon points="3,10.5 16,18 16,29 3,21.5" fill="#4338CA" />
              <polygon points="16,18 29,10.5 29,21.5 16,29" fill="#38BDF8" />
            </svg>
          </div>
          <span className="role-logo-title">TradeLink</span>
        </Link>
      </header>

      {/* Screen 4 Stepper Bar */}
      <div className="wireframe-stepper-container">
        <div className="wireframe-step-item past">
          <div className="wireframe-step-num">1</div>
          <span className="wireframe-step-text">Sign Up</span>
        </div>
        <div className="wireframe-step-line past"></div>

        <div className="wireframe-step-item past">
          <div className="wireframe-step-num">2</div>
          <span className="wireframe-step-text">Role Selection</span>
        </div>
        <div className="wireframe-step-line active"></div>

        <div className="wireframe-step-item current">
          <div className="wireframe-step-num active">3</div>
          <span className="wireframe-step-text active">Consumer Details</span>
        </div>
        <div className="wireframe-step-line"></div>

        <div className="wireframe-step-item">
          <div className="wireframe-step-num">4</div>
          <span className="wireframe-step-text">Dashboard</span>
        </div>
      </div>

      {/* Main 2-Column Card matching Screen 4 */}
      <div className="consumer-wireframe-modal animate-fade-in">
        {/* Left Side: Form */}
        <div className="consumer-form-column">
          <div className="consumer-header-block">
            <h1 className="consumer-wireframe-title">Tell us about yourself</h1>
            <p className="consumer-wireframe-sub">Help us personalize your experience</p>
          </div>

          <form onSubmit={handleSubmit} className="consumer-wireframe-form">
            {/* Interests / Categories Dropdown */}
            <div className="wireframe-field-group">
              <label className="wireframe-field-label">Interests / Categories</label>
              <div className="category-dropdown-wrapper">
                <button
                  type="button"
                  className="category-dropdown-toggle"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <span className="category-dropdown-summary">
                    {interests.length === 0
                      ? 'Select categories'
                      : `${interests.length} categories selected (${interests.slice(0, 2).map(id => CATEGORIES.find(c => c.id === id)?.label).join(', ')}${interests.length > 2 ? '...' : ''})`}
                  </span>
                  <ChevronDown size={16} color="#64748B" />
                </button>

                {showCategoryDropdown && (
                  <div className="category-dropdown-menu animate-fade-in">
                    {CATEGORIES.map((cat) => {
                      const isSelected = interests.includes(cat.id);
                      return (
                        <div
                          key={cat.id}
                          className={`category-dropdown-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleInterest(cat.id)}
                        >
                          <CategoryIcon id={cat.id} size={16} />
                          <span className="category-item-label">{cat.label}</span>
                          {isSelected && <Check size={16} className="category-item-check" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Pills */}
              <div className="selected-category-chips">
                {interests.map((catId) => {
                  const cat = CATEGORIES.find((c) => c.id === catId);
                  if (!cat) return null;
                  return (
                    <span key={catId} className="mini-interest-pill">
                      <CategoryIcon id={catId} size={12} />
                      <span>{cat.label}</span>
                      <button
                        type="button"
                        className="remove-pill-btn"
                        onClick={(e) => { e.stopPropagation(); toggleInterest(catId); }}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* City / Pincode */}
            <div className="wireframe-field-group">
              <label className="wireframe-field-label" htmlFor="city-pincode-input">
                City / Pincode
              </label>
              <input
                id="city-pincode-input"
                type="text"
                className="wireframe-field-input"
                placeholder="Enter city or pincode"
                value={cityPincode}
                onChange={(e) => setCityPincode(e.target.value)}
              />
            </div>

            {/* Optional: Company Name */}
            <div className="wireframe-field-group">
              <label className="wireframe-field-label" htmlFor="company-name-input">
                Optional: Company Name
              </label>
              <input
                id="company-name-input"
                type="text"
                className="wireframe-field-input"
                placeholder="Enter company name (optional)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              className="wireframe-btn-continue"
              disabled={isLoading}
              id="consumer-submit-btn"
            >
              {isLoading ? 'Personalizing...' : <>Continue <ArrowRight size={17} /></>}
            </button>
          </form>
        </div>

        {/* Right Side: Recommendation Graphic Card */}
        <div className="consumer-graphic-column">
          <div className="consumer-artwork-wrap">
            <img
              src={consumerRecImg}
              alt="Personalized product recommendations"
              className="consumer-artwork-img"
            />
          </div>
          <p className="consumer-artwork-caption">
            Get personalized product recommendations based on your interests.
          </p>
        </div>
      </div>
    </div>
  );
}

