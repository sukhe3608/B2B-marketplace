/* ============================================================
   TradeLink — Seller Limited Dashboard (Screen 9 Wireframe Match)
   Amber verification banner, Verify Business CTA, Available & Pending lists.
   ============================================================ */
import { Link } from 'react-router-dom';
import { Search, FileText, UserCheck, MessageSquare, ShieldAlert, CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks';
import DashboardShell from '../../components/layout/DashboardShell';
import './SellerPages.css';

export default function LimitedDashboard() {
  const { user } = useAuth();

  const availableFeatures = [
    'Browse products & suppliers',
    'View RFQs',
    'Limited profile',
    'Basic messaging',
  ];

  const pendingFeatures = [
    'GST / PAN verification',
    'Business KYC',
    'Full dashboard access',
  ];

  return (
    <DashboardShell role="seller">
      <div className="limited-dashboard animate-fade-in-up">
        {/* Top Warning Banner matching Screen 9 */}
        <div className="limited-banner" style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '16px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#92400E', fontSize: '14px' }}>
              Your account is under verification
            </div>
            <div style={{ color: '#B45309', fontSize: '13px', marginTop: 2 }}>
              You can browse products and explore the marketplace. Some features will be available after verification.
            </div>
          </div>
        </div>

        {/* Welcome Card matching Screen 9 */}
        <div className="limited-welcome card" style={{ padding: '28px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
              Welcome, {user?.companyName || user?.name || 'ABC Traders'}!
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px' }}>
              Let's get your business verified to unlock all features.
            </p>
          </div>
          <Link to="/seller/verification" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', padding: '12px 24px', borderRadius: '10px', fontWeight: 600 }}>
            Verify Business <ArrowRight size={16} />
          </Link>
        </div>

        {/* Available vs Pending Features matching Screen 9 */}
        <div className="limited-features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Available Now */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#10B981', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} /> What's Available Now
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {availableFeatures.map((label, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#334155' }}>
                  <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F59E0B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} /> What's Pending
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingFeatures.map((label, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#64748B' }}>
                  <Clock size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
