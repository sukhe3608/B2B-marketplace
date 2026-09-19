/* ============================================================
   TradeLink — Navbar Component
   Public, consumer, and seller navbar variants.
   ============================================================ */
import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Menu, X, Bell, ChevronDown, LogOut, User,
  Settings, ShoppingBag, Store,
} from 'lucide-react';
import { useAuth, useClickOutside, useBreakpoint } from '../../hooks';
import { NAV_LINKS } from '../../utils/constants';
import './Navbar.css';

export default function Navbar({ variant = 'public' }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet } = useBreakpoint();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);

  useClickOutside(profileRef, () => setProfileOpen(false));

  const isCompact = isMobile || isTablet;

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search action would go here
  };

  return (
    <nav className={`navbar navbar-${variant}`} id="main-navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <div className="navbar-logo-icon">
            <Store size={24} />
          </div>
          <span className="navbar-logo-text">TradeLink</span>
        </Link>

        {/* Public nav links (desktop only) */}
        {variant === 'public' && !isCompact && (
          <div className="navbar-links">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="navbar-link">
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Search bar (dashboard variants) */}
        {(variant === 'consumer' || variant === 'seller') && !isCompact && (
          <form className="navbar-search" onSubmit={handleSearch}>
            <Search size={18} className="navbar-search-icon" />
            <input
              type="text"
              placeholder="Search products, suppliers, categories..."
              className="navbar-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="navbar-search-input"
            />
          </form>
        )}

        {/* Right section */}
        <div className="navbar-right">
          {!isAuthenticated ? (
            /* Public — Login/Signup buttons */
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" id="nav-login-btn">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm" id="nav-signup-btn">
                Sign Up
              </Link>
            </>
          ) : (
            /* Authenticated — Notifications + Profile */
            <>
              <button className="btn btn-icon navbar-notification" id="nav-notification-btn">
                <Bell size={20} />
                <span className="notification-dot"></span>
              </button>

              <div className="navbar-profile" ref={profileRef}>
                <button
                  className="navbar-profile-trigger"
                  onClick={() => setProfileOpen(!profileOpen)}
                  id="nav-profile-btn"
                >
                  <div className="avatar avatar-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  {!isCompact && (
                    <>
                      <span className="navbar-profile-name">{user?.name?.split(' ')[0]}</span>
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>

                {profileOpen && (
                  <div className="navbar-profile-dropdown animate-fade-in" id="nav-profile-dropdown">
                    <div className="profile-dropdown-header">
                      <div className="avatar avatar-md">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="profile-dropdown-name">{user?.name}</div>
                        <div className="profile-dropdown-role">
                          {user?.role === 'seller' ? 'Seller Account' : 'Buyer Account'}
                        </div>
                      </div>
                    </div>
                    <div className="profile-dropdown-divider"></div>
                    <Link
                      to={user?.role === 'seller' ? '/seller/company-profile' : '/consumer/profile'}
                      className="profile-dropdown-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={16} /> Profile
                    </Link>
                    <Link
                      to={user?.role === 'seller' ? '/seller/settings' : '/consumer/settings'}
                      className="profile-dropdown-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings size={16} /> Settings
                    </Link>
                    <div className="profile-dropdown-divider"></div>
                    <button className="profile-dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mobile menu toggle */}
          {isCompact && variant === 'public' && (
            <button
              className="btn btn-icon navbar-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="nav-mobile-toggle"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isCompact && mobileMenuOpen && variant === 'public' && (
        <div className="navbar-mobile-menu animate-fade-in-down" id="nav-mobile-menu">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="navbar-mobile-link">
              {link.label}
            </a>
          ))}
          {!isAuthenticated && (
            <div className="navbar-mobile-actions">
              <Link to="/login" className="btn btn-secondary btn-full btn-sm">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-full btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
