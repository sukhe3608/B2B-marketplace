import React, { useState, useEffect } from 'react';
import { RefreshCw, Radio, CheckCircle2 } from 'lucide-react';
import useAdminStore from '../store/adminStore';

export default function Topbar({ title = 'Verification Portal' }) {
  const { refresh } = useAdminStore();
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  const handleRefresh = () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => {
      setRefreshing(false);
      setLastSynced(new Date().toLocaleTimeString());
    }, 400);
  };

  return (
    <header className="admin-topbar">
      <div className="topbar-title">{title}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text2)' }}>
          <Radio size={14} color="#10B981" className="animate-pulse" />
          <span>Real-time Sync Active</span>
          <span style={{ color: 'var(--text3)', marginLeft: '4px' }}>({lastSynced})</span>
        </div>

        <button 
          onClick={handleRefresh}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          title="Force refresh data from localStorage"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}
