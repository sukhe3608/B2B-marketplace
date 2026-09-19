/* ============================================================
   TradeLink — Role Selection Page (Screen 3 Wireframe Match)
   "I am a..." — Consumer vs Seller cards with circular action buttons.
   ============================================================ */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Store, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks';
import './Onboarding.css';

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const { setRole } = useAuth();
  const [loadingRole, setLoadingRole] = useState(null);

  const handleSelectRole = async (role) => {
    setLoadingRole(role);
    await new Promise((r) => setTimeout(r, 400));
    setRole(role);
    navigate(role === 'consumer' ? '/onboarding/consumer-details' : '/onboarding/seller-details');
  };

  return (
    <div className="role-page-wrapper">
      {/* Top Header Bar */}
      <header className="role-header-bar">
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

        <button
          type="button"
          className="role-skip-link"
          onClick={() => handleSelectRole('consumer')}
        >
          Skip for now →
        </button>
      </header>

      {/* Main Container matching Screen 3 */}
      <main className="role-main-container animate-fade-in">
        <div className="role-heading-group">
          <h1 className="role-main-title">I am a...</h1>
          <p className="role-main-subtitle">Choose the role that best describes you.</p>
        </div>

        <div className="role-wireframe-cards">
          {/* Consumer Card */}
          <div
            className="role-wireframe-card consumer-card"
            onClick={() => handleSelectRole('consumer')}
            id="role-select-consumer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSelectRole('consumer')}
          >
            <div className="role-avatar-circle consumer-avatar">
              <User size={38} strokeWidth={2.2} />
            </div>

            <h2 className="role-card-heading consumer-text">Consumer</h2>
            <p className="role-card-subheading">I want to buy<br />products/services</p>

            <button
              type="button"
              className="role-circle-btn consumer-btn"
              aria-label="Continue as Consumer"
              disabled={loadingRole !== null}
            >
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Seller Card */}
          <div
            className="role-wireframe-card seller-card"
            onClick={() => handleSelectRole('seller')}
            id="role-select-seller"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSelectRole('seller')}
          >
            <div className="role-avatar-circle seller-avatar">
              <Store size={38} strokeWidth={2.2} />
            </div>

            <h2 className="role-card-heading seller-text">Seller</h2>
            <p className="role-card-subheading">I want to sell / list<br />my business</p>

            <button
              type="button"
              className="role-circle-btn seller-btn"
              aria-label="Continue as Seller"
              disabled={loadingRole !== null}
            >
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

