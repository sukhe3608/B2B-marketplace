import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  BarChart3, 
  Settings, 
  ExternalLink,
  Users
} from 'lucide-react';
import useAdminStore from '../store/adminStore';

export default function Sidebar() {
  const { requests, currentAdmin } = useAdminStore();

  const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 're_submitted').length;

  return (
    <aside className="admin-sidebar">
      {/* Brand Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <ShieldCheck size={20} color="#fff" />
        </div>
        <div>
          <div className="sidebar-logo-name">TradeLink Admin</div>
          <span className="sidebar-logo-tag">VERIFICATION OPS</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="sidebar-nav">
        <NavLink 
          to="/" 
          end 
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span>Verification Queue</span>
          {pendingCount > 0 && (
            <span style={{ 
              marginLeft: 'auto', 
              background: 'rgba(245, 158, 11, 0.2)', 
              color: '#F59E0B', 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '2px 7px', 
              borderRadius: '12px' 
            }}>
              {pendingCount}
            </span>
          )}
        </NavLink>

        <NavLink 
          to="/analytics" 
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={18} />
          <span>Metrics & Reports</span>
        </NavLink>

        <a 
          href="http://localhost:5173" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="sidebar-nav-item"
          title="Open Main B2B Marketplace in new tab"
        >
          <ExternalLink size={18} />
          <span>Main B2B Platform</span>
        </a>
      </nav>

      {/* Admin User Info */}
      <div className="sidebar-bottom">
        <div className="sidebar-admin-card">
          <div className="sidebar-admin-avatar">
            {currentAdmin?.avatar || 'AD'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="sidebar-admin-name">{currentAdmin?.name || 'Compliance Admin'}</div>
            <div className="sidebar-admin-role">{currentAdmin?.role || 'Reviewer'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
