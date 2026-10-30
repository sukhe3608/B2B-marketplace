import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import useAdminStore from '../store/adminStore';

export default function ApproveModal({ request, onClose, onApproved }) {
  const { approve, currentAdmin } = useAdminStore();
  const [internalNotes, setInternalNotes] = useState('');

  const handleApprove = (e) => {
    e.preventDefault();
    approve(
      request.id,
      currentAdmin?.name || 'Compliance Admin',
      internalNotes.trim()
    );
    if (onApproved) onApproved();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} color="var(--success)" />
            <h3 className="modal-title">Approve Verification</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleApprove}>
          <div className="modal-body">
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ 
                width: '54px', 
                height: '54px', 
                borderRadius: '50%', 
                background: 'rgba(16, 185, 129, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 14px' 
              }}>
                <ShieldCheck size={30} color="var(--success)" />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
                Grant Verified Seller Status
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text2)', maxWidth: '380px', margin: '0 auto' }}>
                Are you sure you want to approve <strong>{request.companyName || request.sellerName}</strong>? 
                This will grant the Verified Seller Badge and enable verified marketplace benefits.
              </p>
            </div>

            <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '12px 16px', fontSize: '12.5px', color: 'var(--text2)' }}>
              <div><strong>GSTIN:</strong> {request.gstNumber || 'N/A'}</div>
              <div><strong>PAN:</strong> {request.panNumber || 'N/A'}</div>
              <div><strong>Reviewer:</strong> {currentAdmin?.name || 'Compliance Admin'}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Internal Approval Note (Optional)</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. Verified cross-referenced with MCA records."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              Confirm & Mark Verified
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
