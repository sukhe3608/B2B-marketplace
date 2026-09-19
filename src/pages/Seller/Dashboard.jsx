/* ============================================================
   TradeLink — Seller Dashboard (Screen 8)
   Analytics, quick actions, chart, recent RFQs.
   ============================================================ */
import { Link } from 'react-router-dom';
import {
  Package, FileText, ShoppingCart, Plus, Eye, TrendingUp,
  ArrowRight, ChevronRight, ShieldCheck, BarChart3
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../hooks';
import DashboardShell from '../../components/layout/DashboardShell';
import { MOCK_SELLER_STATS, MOCK_RFQS, RFQ_STATUSES } from '../../utils/constants';
import './SellerPages.css';

export default function SellerDashboard({ activePage = 'dashboard' }) {
  const { user, verificationStatus } = useAuth();

  if (activePage !== 'dashboard') {
    return (
      <DashboardShell role="seller">
        <div className="animate-fade-in-up">
          <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-4)' }}>
            {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          </h1>
          <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <Package size={48} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto var(--space-4)' }} />
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Coming Soon</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>This section is under development.</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="seller">
      <div className="seller-dashboard animate-fade-in-up">
        {/* Header */}
        <div className="seller-dashboard-header">
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-1)' }}>
              Welcome, {user?.companyName || user?.name || 'Seller'}!
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Manage your business, products and leads from here.
            </p>
          </div>
          {verificationStatus === 'verified' && (
            <span className="badge badge-success" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
              <ShieldCheck size={14} /> Verified Seller
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="seller-stats-row stagger-children">
          <div className="card stat-card card-hover">
            <div className="stat-card-icon primary"><Package size={22} /></div>
            <div>
              <div className="stat-card-value">{MOCK_SELLER_STATS.totalProducts}</div>
              <div className="stat-card-label">Total Products</div>
            </div>
          </div>
          <div className="card stat-card card-hover">
            <div className="stat-card-icon accent"><FileText size={22} /></div>
            <div>
              <div className="stat-card-value">{MOCK_SELLER_STATS.activeRFQs}</div>
              <div className="stat-card-label">Active RFQs</div>
            </div>
          </div>
          <div className="card stat-card card-hover">
            <div className="stat-card-icon warning"><ShoppingCart size={22} /></div>
            <div>
              <div className="stat-card-value">{MOCK_SELLER_STATS.pendingOrders}</div>
              <div className="stat-card-label">Pending Orders</div>
            </div>
          </div>
        </div>

        {/* Grid: Growth Chart on Left, Quick Actions Card on Right (matching Screen 8) */}
        <div className="seller-middle-grid">
          {/* Growth Chart */}
          <div className="seller-chart-card">
            <div className="seller-chart-header">
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-1)' }}>
                  Your Business Growth
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  Monthly leads & views overview
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <TrendingUp size={16} style={{ color: 'var(--color-success)' }} />
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)', fontWeight: 'var(--font-weight-semibold)' }}>
                  +12% Monthly
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={MOCK_SELLER_STATS.monthlyGrowth}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#fff', border: '1px solid #E2E8F0',
                    borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '13px'
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="#4F46E5" fill="url(#colorViews)" strokeWidth={2} />
                <Area type="monotone" dataKey="leads" stroke="#10B981" fill="url(#colorLeads)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions Card matching Screen 8 */}
          <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: '#64748B', marginBottom: 'var(--space-4)' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: '10px' }}>
                <Plus size={18} style={{ color: '#4F46E5', marginRight: 8 }} />
                <span style={{ fontWeight: 600, color: '#1E293B' }}>Add Product</span>
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: '10px' }}>
                <FileText size={18} style={{ color: '#4F46E5', marginRight: 8 }} />
                <span style={{ fontWeight: 600, color: '#1E293B' }}>Create RFQ</span>
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '12px 16px', borderRadius: '10px' }}>
                <Eye size={18} style={{ color: '#4F46E5', marginRight: 8 }} />
                <span style={{ fontWeight: 600, color: '#1E293B' }}>View Orders</span>
              </button>
            </div>
          </div>
        </div>

        {/* Full-width Recent RFQs Table matching Screen 8 */}
        <div className="seller-rfqs-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>Recent RFQs</h3>
            <Link to="/seller/rfqs" className="btn btn-text btn-sm">View All <ChevronRight size={14} /></Link>
          </div>
          <div className="seller-rfq-list">
            {MOCK_RFQS.slice(0, 3).map((rfq) => {
              const status = RFQ_STATUSES[rfq.status.toUpperCase()] || RFQ_STATUSES.OPEN;
              return (
                <div key={rfq.id} className="seller-rfq-item" style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <div style={{ width: 38, height: 38, background: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', flexShrink: 0 }}>
                    <Package size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="seller-rfq-product truncate" style={{ fontWeight: 600, color: '#0F172A' }}>{rfq.product}</div>
                    <div className="seller-rfq-meta">
                      Qty: {rfq.quantity || 50} · {rfq.createdAt}
                    </div>
                  </div>
                  <span className={`badge badge-${status.color}`} style={{ marginRight: '12px' }}>{status.label}</span>
                  <button className="btn btn-secondary btn-sm" style={{ padding: '4px 12px', fontSize: '12px' }}>
                    View
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
