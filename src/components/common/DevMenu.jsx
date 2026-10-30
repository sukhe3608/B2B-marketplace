/* ============================================================
   TradeLink — Dev Menu
   Dev-only floating menu with Reset Demo Data and debug tools.
   ============================================================ */
import { useState } from 'react';
import { RotateCcw, Wrench, X, Database, Check, ShieldCheck } from 'lucide-react';
import { mockDb } from '../../services/mockDb';
import useAuthStore from '../../store/authStore';

export default function DevMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const user = useAuthStore((s) => s.user);
  const verificationStatus = useAuthStore((s) => s.verificationStatus);
  const setVerificationStatus = useAuthStore((s) => s.setVerificationStatus);

  // In production builds, do not render
  if (!import.meta.env.DEV) {
    return null;
  }

  const handleReset = async () => {
    if (!window.confirm('Reset all demo data to initial seed? Current edits will be lost.')) {
      return;
    }
    setResetting(true);
    try {
      mockDb.resetDemo();
      setResetDone(true);
      setTimeout(() => {
        setResetDone(false);
        setIsOpen(false);
        window.location.reload();
      }, 700);
    } catch (err) {
      console.error('Reset failed:', err);
      alert('Failed to reset demo data: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleStatusChange = (status) => {
    setVerificationStatus(status);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        fontFamily: 'var(--font-family, sans-serif)',
      }}
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          title="Developer Tools / Reset Demo Data"
          aria-label="Developer Menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid #475569',
            borderRadius: '9999px',
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            transition: 'all 0.2s ease',
          }}
        >
          <Wrench size={14} />
          <span>Dev Menu</span>
        </button>
      ) : (
        <div
          style={{
            backgroundColor: '#0F172A',
            color: '#F8FAFC',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '16px',
            width: '260px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              borderBottom: '1px solid #1E293B',
              paddingBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13px' }}>
              <Database size={16} color="#38BDF8" />
              <span>Dev Controls</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close Dev Menu"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ marginBottom: '14px', borderBottom: '1px solid #1E293B', paddingBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Seller Verification State
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {['approved', 'pending', 'rejected', 'suspended'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  style={{
                    padding: '6px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: verificationStatus === st ? '#38BDF8' : '#334155',
                    backgroundColor: verificationStatus === st ? '#0369A1' : '#1E293B',
                    color: verificationStatus === st ? '#FFFFFF' : '#94A3B8',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '14px', lineHeight: 1.4 }}>
            Manage the local mock store across tabs. Reset reloads fresh seed data.
          </p>

          <button
            onClick={handleReset}
            disabled={resetting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: resetDone ? '#10B981' : '#E11D48',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: resetting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {resetDone ? (
              <>
                <Check size={14} />
                <span>Reset Complete!</span>
              </>
            ) : (
              <>
                <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
                <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

