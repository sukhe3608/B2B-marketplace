/* ============================================================
   TradeLink — DashboardShell Component
   Sidebar + content area layout for Consumer/Seller dashboards.
   ============================================================ */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Heart, MessageSquare, User, Settings,
  Package, ShoppingCart, Building2, ShieldCheck, ChevronLeft, ChevronRight, Store, Check,
} from 'lucide-react';
import Navbar from './Navbar';
import { CONSUMER_NAV, SELLER_NAV } from '../../utils/constants';
import { useBreakpoint } from '../../hooks';
import './DashboardShell.css';

const ICON_MAP = {
  LayoutDashboard, FileText, Heart, MessageSquare, User, Settings,
  Package, ShoppingCart, Building2, ShieldCheck,
};

export default function DashboardShell({ role = 'consumer', children }) {
  const location = useLocation();
  const { isMobile, isTablet } = useBreakpoint();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = role === 'seller' ? SELLER_NAV : CONSUMER_NAV;
  const isCompact = isMobile || isTablet;

  return (
    <div className="dashboard-shell">
      <Navbar variant={role} />

      <div className="dashboard-body">
        {/* Sidebar */}
        {!isCompact ? (
          <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} id="dashboard-sidebar">
            <div className="sidebar-header">
              {!sidebarCollapsed && (
                <Link to="/" className="sidebar-logo">
                  <div className="sidebar-logo-icon"><Store size={20} /></div>
                  <span>TradeLink</span>
                </Link>
              )}
              <button
                className="sidebar-toggle"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>

            <nav className="sidebar-nav">
              {navItems.map((item) => {
                const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    title={sidebarCollapsed ? item.label : undefined}
                    id={`sidebar-${item.id}`}
                  >
                    <Icon size={20} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                    {item.id === 'verification' && role === 'seller' && !sidebarCollapsed && (
                      <span className="sidebar-badge"><Check size={12} strokeWidth={3} /></span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </aside>
        ) : (
          /* Mobile bottom tab bar */
          <nav className="dashboard-bottom-nav" id="dashboard-bottom-nav">
            {navItems.slice(0, 5).map((item) => {
              const Icon = ICON_MAP[item.icon] || LayoutDashboard;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Main Content */}
        <main className={`dashboard-content ${sidebarCollapsed ? 'expanded' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
