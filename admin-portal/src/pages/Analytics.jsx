import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  PieChart,
  ShieldAlert,
  Award
} from 'lucide-react';
import useAdminStore, { REJECTION_ITEMS } from '../store/adminStore';

export default function Analytics() {
  const { requests } = useAdminStore();

  const total = requests.length;
  const verified = requests.filter(r => r.status === 'verified').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const inReview = requests.filter(r => r.status === 'under_review').length;
  const pending = requests.filter(r => r.status === 'pending' || r.status === 're_submitted').length;

  const approvalRate = total > 0 ? Math.round((verified / (verified + rejected || 1)) * 100) : 0;
  const rejectionRate = total > 0 ? Math.round((rejected / (verified + rejected || 1)) * 100) : 0;

  // Aggregate rejection reasons
  const reasonCounts = {};
  REJECTION_ITEMS.forEach(item => { reasonCounts[item.id] = 0; });

  requests.forEach(r => {
    (r.rejectedItems || []).forEach(id => {
      if (reasonCounts[id] !== undefined) {
        reasonCounts[id] += 1;
      }
    });
  });

  const sortedReasons = REJECTION_ITEMS
    .map(item => ({ ...item, count: reasonCounts[item.id] || 0 }))
    .sort((a, b) => b.count - a.count);

  const maxReasonCount = Math.max(...sortedReasons.map(r => r.count), 1);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance Analytics & Rejection Insights</h1>
          <p className="page-subtitle">
            Track verification throughput, approval ratios, and recurring deficiency causes across sellers.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary2)' }}>
            <Award size={22} />
          </div>
          <div>
            <div className="stat-card-value">{approvalRate}%</div>
            <div className="stat-card-label">Overall Approval Ratio</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="stat-card-value">{rejectionRate}%</div>
            <div className="stat-card-label">Rejection / Deficient Rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="stat-card-value">{verified}</div>
            <div className="stat-card-label">Active Verified Sellers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-card-value">{total}</div>
            <div className="stat-card-label">Total Cumulative Submissions</div>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Top Rejection Reasons Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} color="var(--danger)" />
            Most Common Rejection Triggers
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sortedReasons.map(item => (
              <div key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text)' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.count > 0 ? '#F87171' : 'var(--text3)' }}>
                    {item.count} flag{item.count === 1 ? '' : 's'}
                  </span>
                </div>
                <div style={{ height: '8px', background: 'var(--surface2)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${item.count > 0 ? Math.max((item.count / maxReasonCount) * 100, 8) : 0}%`, 
                      background: 'linear-gradient(90deg, #EF4444, #F87171)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={16} color="var(--primary2)" />
            Queue Composition
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--surface2)', borderRadius: '8px' }}>
              <span style={{ color: '#10B981', fontWeight: 600 }}>Verified Sellers</span>
              <span style={{ fontWeight: 700 }}>{verified} ({total ? Math.round((verified/total)*100) : 0}%)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--surface2)', borderRadius: '8px' }}>
              <span style={{ color: '#EF4444', fontWeight: 600 }}>Rejected / Fix Needed</span>
              <span style={{ fontWeight: 700 }}>{rejected} ({total ? Math.round((rejected/total)*100) : 0}%)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--surface2)', borderRadius: '8px' }}>
              <span style={{ color: '#3B82F6', fontWeight: 600 }}>Currently In Review</span>
              <span style={{ fontWeight: 700 }}>{inReview} ({total ? Math.round((inReview/total)*100) : 0}%)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--surface2)', borderRadius: '8px' }}>
              <span style={{ color: '#F59E0B', fontWeight: 600 }}>Pending Action</span>
              <span style={{ fontWeight: 700 }}>{pending} ({total ? Math.round((pending/total)*100) : 0}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
