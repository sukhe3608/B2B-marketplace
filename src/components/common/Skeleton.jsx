/* ============================================================
   TradeLink — Comprehensive Skeleton Loader Components
   Production-ready, highly composable skeleton loading elements
   ============================================================ */
import React from 'react';
import './Skeleton.css';

/**
 * Base Atomic Skeleton Component
 */
export function Skeleton({
  variant = 'rounded',
  width,
  height,
  className = '',
  style = {},
  animation = 'shimmer',
  count = 1,
}) {
  const customStyle = {
    ...style,
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'text':
        return 'skeleton-variant-text';
      case 'circular':
        return 'skeleton-variant-circular';
      case 'rectangular':
        return 'skeleton-variant-rectangular';
      case 'rounded':
      default:
        return 'skeleton-variant-rounded';
    }
  };

  const getAnimClass = () => {
    if (animation === 'none') return 'skeleton-none';
    if (animation === 'pulse') return 'skeleton-pulse';
    return 'skeleton-shimmer';
  };

  const combinedClass = `skeleton-base ${getVariantClass()} ${getAnimClass()} ${className}`.trim();

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={combinedClass} style={customStyle} aria-hidden="true" />
        ))}
      </>
    );
  }

  return <div className={combinedClass} style={customStyle} aria-hidden="true" />;
}

/**
 * SkeletonText — Multi-line text with natural randomized/proportional widths
 */
export function SkeletonText({ lines = 3, widths = ['100%', '85%', '65%'], height = 14, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="text"
          height={height}
          width={widths[idx % widths.length]}
          style={{ margin: 0 }}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonStatCard — For KPI / Metric cards in dashboards
 */
export function SkeletonStatCard({ count = 1 }) {
  const items = Array.from({ length: count });

  if (count === 1) {
    return (
      <div className="skeleton-stat-card">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="skeleton-stat-content">
          <Skeleton variant="text" width="40%" height={26} style={{ margin: 0 }} />
          <Skeleton variant="text" width="65%" height={14} style={{ margin: 0 }} />
        </div>
      </div>
    );
  }

  return (
    <>
      {items.map((_, i) => (
        <div key={i} className="skeleton-stat-card">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="skeleton-stat-content">
            <Skeleton variant="text" width="40%" height={26} style={{ margin: 0 }} />
            <Skeleton variant="text" width="65%" height={14} style={{ margin: 0 }} />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * SkeletonCard — For product, supplier, or generic cards
 */
export function SkeletonCard({ count = 1, showMedia = true, lines = 2 }) {
  const items = Array.from({ length: count });

  const renderCard = (key) => (
    <div key={key} className="skeleton-card">
      {showMedia && <Skeleton variant="rounded" className="skeleton-card-media" />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="rounded" width="55%" height={20} />
        <Skeleton variant="rounded" width="22%" height={18} />
      </div>
      <SkeletonText lines={lines} widths={['95%', '70%']} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <Skeleton variant="rounded" width="30%" height={16} />
        <Skeleton variant="rounded" width="35%" height={34} />
      </div>
    </div>
  );

  if (count === 1) return renderCard(0);

  return <>{items.map((_, i) => renderCard(i))}</>;
}

/**
 * SkeletonTable — Responsive tabular skeleton
 */
export function SkeletonTable({ rows = 5, columns = 6, showHeader = true }) {
  const rowList = Array.from({ length: rows });
  const colList = Array.from({ length: columns });

  return (
    <div className="skeleton-table-container">
      <table className="skeleton-table">
        {showHeader && (
          <thead>
            <tr>
              {colList.map((_, ci) => (
                <th key={ci}>
                  <Skeleton variant="text" width={ci === 0 ? '70%' : '50%'} height={15} style={{ margin: 0 }} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rowList.map((_, ri) => (
            <tr key={ri}>
              {colList.map((_, ci) => (
                <td key={ci}>
                  {ci === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Skeleton variant="rounded" width={38} height={38} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <Skeleton variant="text" width="85%" height={14} style={{ marginBottom: 4 }} />
                        <Skeleton variant="text" width="45%" height={11} style={{ margin: 0 }} />
                      </div>
                    </div>
                  ) : ci === columns - 1 ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <Skeleton variant="rounded" width={65} height={30} style={{ margin: 0 }} />
                    </div>
                  ) : (
                    <Skeleton
                      variant="text"
                      width={ci % 2 === 0 ? '60%' : '45%'}
                      height={13}
                      style={{ margin: 0 }}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * SkeletonListItem — For list views, RFQs list, notification rows
 */
export function SkeletonListItem({ count = 3, showIcon = true }) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <div className="skeleton-list-left">
            {showIcon && <Skeleton variant="rounded" width={42} height={42} style={{ flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <Skeleton variant="text" width="55%" height={16} style={{ marginBottom: 6 }} />
              <Skeleton variant="text" width="80%" height={12} style={{ margin: 0 }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Skeleton variant="rounded" width={64} height={24} />
            <Skeleton variant="rounded" width={56} height={32} />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * SkeletonChart — Visual chart placeholder with simulated bars and curve
 */
export function SkeletonChart({ height = 240 }) {
  const barHeights = [45, 65, 35, 80, 55, 90, 70, 85, 60, 95];

  return (
    <div className="skeleton-chart-card">
      <div className="skeleton-chart-header">
        <div>
          <Skeleton variant="rounded" width={180} height={20} style={{ marginBottom: 8 }} />
          <Skeleton variant="text" width={130} height={12} style={{ margin: 0 }} />
        </div>
        <Skeleton variant="rounded" width={85} height={24} />
      </div>
      <div className="skeleton-chart-canvas" style={{ height: `${height}px` }}>
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="skeleton-chart-bar"
            style={{
              height: `${h}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="text" width={32} height={10} style={{ margin: 0 }} />
        ))}
      </div>
    </div>
  );
}

/**
 * SkeletonPageHeader — Standard header with title and buttons
 */
export function SkeletonPageHeader({ showAction = true, style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
        ...style,
      }}
    >
      <div>
        <Skeleton variant="rounded" width={240} height={28} style={{ marginBottom: 8 }} />
        <Skeleton variant="text" width={340} height={14} style={{ margin: 0 }} />
      </div>
      {showAction && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Skeleton variant="rounded" width={110} height={40} />
          <Skeleton variant="rounded" width={130} height={40} />
        </div>
      )}
    </div>
  );
}

/**
 * SkeletonFilterBar — Search input and filter tabs
 */
export function SkeletonFilterBar() {
  return (
    <div className="skeleton-filter-bar">
      <div className="skeleton-filter-pills">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={i === 0 ? 50 : 80 + (i % 3) * 15} height={36} />
        ))}
      </div>
      <Skeleton variant="rounded" width={260} height={38} />
    </div>
  );
}

/**
 * SkeletonForm — Form inputs with label and action buttons
 */
export function SkeletonForm({ fields = 4 }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #F1F5F9',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton variant="text" width={120 + (i % 2) * 40} height={14} style={{ margin: 0 }} />
          <Skeleton variant="rounded" width="100%" height={44} />
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
        <Skeleton variant="rounded" width={90} height={42} />
        <Skeleton variant="rounded" width={140} height={42} />
      </div>
    </div>
  );
}

/**
 * SkeletonProfile — Profile header + details card
 */
export function SkeletonProfile() {
  return (
    <div>
      <div className="skeleton-profile-header">
        <Skeleton variant="circular" width={80} height={80} />
        <div style={{ flex: 1 }}>
          <Skeleton variant="rounded" width={220} height={24} style={{ marginBottom: 8 }} />
          <Skeleton variant="text" width={160} height={14} style={{ marginBottom: 6 }} />
          <Skeleton variant="text" width={280} height={12} style={{ margin: 0 }} />
        </div>
        <Skeleton variant="rounded" width={120} height={38} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <SkeletonForm fields={4} />
        <SkeletonForm fields={3} />
      </div>
    </div>
  );
}

/**
 * SkeletonMessages — Split pane messaging view
 */
export function SkeletonMessages() {
  return (
    <div className="skeleton-messages-wrapper">
      <div className="skeleton-conv-sidebar">
        <Skeleton variant="rounded" width="100%" height={38} style={{ marginBottom: 8 }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 0' }}>
            <Skeleton variant="circular" width={42} height={42} />
            <div style={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={14} style={{ marginBottom: 4 }} />
              <Skeleton variant="text" width="90%" height={11} style={{ margin: 0 }} />
            </div>
          </div>
        ))}
      </div>

      <div className="skeleton-chat-viewport">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid #F1F5F9', marginBottom: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Skeleton variant="circular" width={38} height={38} />
            <div>
              <Skeleton variant="text" width={140} height={14} style={{ marginBottom: 4 }} />
              <Skeleton variant="text" width={90} height={10} style={{ margin: 0 }} />
            </div>
          </div>
          <Skeleton variant="rounded" width={80} height={30} />
        </div>

        <div className="skeleton-chat-bubble skeleton-bubble-incoming">
          <Skeleton variant="text" width={200} height={12} style={{ marginBottom: 6 }} />
          <Skeleton variant="text" width={150} height={12} style={{ margin: 0 }} />
        </div>

        <div className="skeleton-chat-bubble skeleton-bubble-outgoing">
          <Skeleton variant="text" width={240} height={12} style={{ marginBottom: 6 }} />
          <Skeleton variant="text" width={180} height={12} style={{ margin: 0 }} />
        </div>

        <div className="skeleton-chat-bubble skeleton-bubble-incoming">
          <Skeleton variant="text" width={170} height={12} style={{ margin: 0 }} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Skeleton variant="rounded" width="100%" height={44} />
          <Skeleton variant="rounded" width={44} height={44} />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonDashboard — Full dashboard placeholder
 */
export function SkeletonDashboard({ role = 'consumer' }) {
  return (
    <div className="skeleton-dashboard-layout">
      {/* Greeting */}
      <SkeletonPageHeader showAction={true} />

      {/* KPI Stats */}
      <div className="skeleton-grid-3">
        <SkeletonStatCard count={3} />
      </div>

      {role === 'seller' ? (
        <>
          <div className="skeleton-grid-2">
            <SkeletonChart height={200} />
            <SkeletonCard count={1} showMedia={false} lines={4} />
          </div>
          <SkeletonTable rows={4} columns={5} />
        </>
      ) : (
        <>
          {/* Banner */}
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 16, border: '1px solid #F1F5F9' }}>
            <Skeleton variant="rounded" width={220} height={24} style={{ marginBottom: 12 }} />
            <Skeleton variant="text" width={320} height={14} style={{ marginBottom: 16 }} />
            <Skeleton variant="rounded" width={140} height={36} />
          </div>

          {/* Categories Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Skeleton variant="rounded" width={180} height={20} />
              <Skeleton variant="rounded" width={70} height={16} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ background: '#FFFFFF', padding: 20, borderRadius: 14, border: '1px solid #F1F5F9', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <Skeleton variant="circular" width={44} height={44} />
                  <Skeleton variant="text" width={80} height={12} style={{ margin: 0 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent RFQs */}
          <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 16, border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Skeleton variant="rounded" width={150} height={20} />
              <Skeleton variant="rounded" width={60} height={16} />
            </div>
            <SkeletonListItem count={3} />
          </div>
        </>
      )}
    </div>
  );
}

export default Skeleton;
