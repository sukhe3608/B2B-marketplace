/* ============================================================
   TradeLink — Consumer Dashboard (Screen 5)
   ============================================================ */
import { Link } from 'react-router-dom';
import {
  FileText, Heart, MessageSquare, ArrowRight, Search,
  ChevronRight, RefreshCw, Package, Factory, Wrench
} from 'lucide-react';
import { useAuth } from '../../hooks';
import DashboardShell from '../../components/layout/DashboardShell';
import CategoryIcon from '../../components/common/CategoryIcon';
import { CATEGORIES, MOCK_CONSUMER_STATS, MOCK_RFQS, RFQ_STATUSES } from '../../utils/constants';
import './ConsumerPages.css';

export default function ConsumerDashboard({ activePage = 'dashboard' }) {
  const { user } = useAuth();

  if (activePage !== 'dashboard') {
    return (
      <DashboardShell role="consumer">
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
    <DashboardShell role="consumer">
      <div className="consumer-dashboard animate-fade-in-up">
        {/* Greeting */}
        <div className="consumer-greeting">
          <div>
            <h1 className="consumer-greeting-title">
              Hello, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="consumer-greeting-subtitle">
              Find the best suppliers and request quotes for your business needs.
            </p>
          </div>
          <button className="btn btn-ghost btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Quick Stats */}
        <div className="consumer-stats-row stagger-children">
          <div className="card stat-card card-hover">
            <div className="stat-card-icon primary"><FileText size={22} /></div>
            <div>
              <div className="stat-card-value">{MOCK_CONSUMER_STATS.activeRFQs}</div>
              <div className="stat-card-label">Active RFQs</div>
            </div>
          </div>
          <div className="card stat-card card-hover">
            <div className="stat-card-icon accent"><Heart size={22} /></div>
            <div>
              <div className="stat-card-value">{MOCK_CONSUMER_STATS.savedSuppliers}</div>
              <div className="stat-card-label">Saved Suppliers</div>
            </div>
          </div>
          <div className="card stat-card card-hover">
            <div className="stat-card-icon secondary"><MessageSquare size={22} /></div>
            <div>
              <div className="stat-card-value">{MOCK_CONSUMER_STATS.messages}</div>
              <div className="stat-card-label">Messages</div>
            </div>
          </div>
        </div>

        {/* Explore Categories CTA */}
        <div className="consumer-explore-card">
          <div className="consumer-explore-content">
            <h2 className="consumer-explore-title">Explore top categories</h2>
            <p className="consumer-explore-desc">
              Discover verified suppliers across a wide range of products
            </p>
            <button className="btn btn-primary btn-sm">
              Browse Categories <ArrowRight size={14} />
            </button>
          </div>
          <div className="consumer-explore-visual">
            <div className="consumer-visual-badge">
              <Package size={26} />
            </div>
            <div className="consumer-visual-badge">
              <Factory size={26} />
            </div>
            <div className="consumer-visual-badge">
              <Wrench size={26} />
            </div>
          </div>
        </div>

        {/* Recommended Categories */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
              Recommended Categories
            </h2>
            <a href="#" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ChevronRight size={14} />
            </a>
          </div>
          <div className="consumer-categories-grid stagger-children">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <a href="#" className="consumer-category-tile card card-hover card-interactive" key={cat.id}>
                <div className="consumer-category-icon" style={{ background: `${cat.color}15`, color: cat.color }}>
                  <CategoryIcon id={cat.id} size={26} />
                </div>
                <span className="consumer-category-label">{cat.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Recent RFQs */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>My Recent RFQs</h2>
            <Link to="/consumer/rfqs" className="btn btn-text btn-sm">View All <ChevronRight size={14} /></Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {MOCK_RFQS.slice(0, 3).map((rfq) => {
              const status = RFQ_STATUSES[rfq.status.toUpperCase()] || RFQ_STATUSES.OPEN;
              return (
                <div key={rfq.id} className="consumer-rfq-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>{rfq.product}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                      {rfq.quantity} · {rfq.budget} · {rfq.quotesReceived} quotes
                    </div>
                  </div>
                  <span className={`badge badge-${status.color}`}>{status.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
