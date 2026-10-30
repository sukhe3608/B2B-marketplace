import React, { useState } from 'react';
import { X, AlertTriangle, CheckSquare, Square } from 'lucide-react';
import useAdminStore, { REJECTION_ITEMS } from '../store/adminStore';

export default function RejectModal({ request, onClose, onRejected }) {
  const { reject, currentAdmin } = useAdminStore();
  const [selectedItems, setSelectedItems] = useState([]);
  const [rejectionNote, setRejectionNote] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [error, setError] = useState('');

  const toggleItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  const handleSelectAllCategory = (docType) => {
    const categoryIds = REJECTION_ITEMS.filter(item => item.doc === docType).map(item => item.id);
    const allSelected = categoryIds.every(id => selectedItems.includes(id));
    if (allSelected) {
      setSelectedItems(prev => prev.filter(id => !categoryIds.includes(id)));
    } else {
      setSelectedItems(prev => Array.from(new Set([...prev, ...categoryIds])));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedItems.length === 0 && !rejectionNote.trim()) {
      setError('Please select at least one rejection reason or write feedback for the seller.');
      return;
    }

    reject(
      request.id, 
      currentAdmin?.name || 'Compliance Admin',
      selectedItems,
      rejectionNote.trim(),
      internalNotes.trim()
    );

    if (onRejected) onRejected();
    onClose();
  };

  const gstReasons = REJECTION_ITEMS.filter(item => item.doc === 'gst');
  const panReasons = REJECTION_ITEMS.filter(item => item.doc === 'pan');
  const kycReasons = REJECTION_ITEMS.filter(item => item.doc === 'kyc');
  const generalReasons = REJECTION_ITEMS.filter(item => item.doc === null);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal" 
        style={{ maxWidth: '640px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--danger)" />
            <h3 className="modal-title">Reject Verification Request</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: 'var(--text)' }}>
              Rejecting request for <strong>{request.companyName || request.sellerName}</strong>.
              The seller will see the marked rejection reasons on their dashboard and will be required to resolve them before sending re-verification.
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '13px', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: '6px' }}>
                {error}
              </div>
            )}

            {/* Rejection Checklist */}
            <div className="form-group">
              <label className="form-label">
                Select Deficiencies / Rejection Reasons <span style={{ color: 'var(--danger)' }}>*</span>
              </label>

              {/* GST Issues */}
              <div className="check-group" style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="check-group-header" style={{ padding: 0 }}>GST Issues</span>
                  <button 
                    type="button" 
                    onClick={() => handleSelectAllCategory('gst')}
                    style={{ fontSize: '11px', color: 'var(--primary2)' }}
                  >
                    Toggle All
                  </button>
                </div>
                {gstReasons.map(item => (
                  <label 
                    key={item.id} 
                    className={`check-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(item.id)} 
                      onChange={() => toggleItem(item.id)}
                    />
                    <span className="check-item-label">{item.label}</span>
                  </label>
                ))}
              </div>

              {/* PAN Issues */}
              <div className="check-group" style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="check-group-header" style={{ padding: 0 }}>PAN Card Issues</span>
                  <button 
                    type="button" 
                    onClick={() => handleSelectAllCategory('pan')}
                    style={{ fontSize: '11px', color: 'var(--primary2)' }}
                  >
                    Toggle All
                  </button>
                </div>
                {panReasons.map(item => (
                  <label 
                    key={item.id} 
                    className={`check-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(item.id)} 
                      onChange={() => toggleItem(item.id)}
                    />
                    <span className="check-item-label">{item.label}</span>
                  </label>
                ))}
              </div>

              {/* KYC Issues */}
              <div className="check-group" style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="check-group-header" style={{ padding: 0 }}>KYC Document Issues</span>
                  <button 
                    type="button" 
                    onClick={() => handleSelectAllCategory('kyc')}
                    style={{ fontSize: '11px', color: 'var(--primary2)' }}
                  >
                    Toggle All
                  </button>
                </div>
                {kycReasons.map(item => (
                  <label 
                    key={item.id} 
                    className={`check-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(item.id)} 
                      onChange={() => toggleItem(item.id)}
                    />
                    <span className="check-item-label">{item.label}</span>
                  </label>
                ))}
              </div>

              {/* Business & Profile Issues */}
              <div className="check-group" style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '8px' }}>
                <span className="check-group-header" style={{ padding: 0 }}>Profile & General Issues</span>
                {generalReasons.map(item => (
                  <label 
                    key={item.id} 
                    className={`check-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(item.id)} 
                      onChange={() => toggleItem(item.id)}
                    />
                    <span className="check-item-label">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Rejection Note to Seller */}
            <div className="form-group">
              <label className="form-label">
                Feedback & Instructions for Seller (Shown on their portal)
              </label>
              <textarea 
                className="form-textarea"
                rows={3}
                placeholder="Example: Please re-upload a clear scanned copy of your GST certificate and ensure the registered entity name matches your profile..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
              />
            </div>

            {/* Internal Reviewer Note */}
            <div className="form-group">
              <label className="form-label">
                Internal Audit Notes (Confidential — visible only to admins)
              </label>
              <input 
                type="text"
                className="form-input"
                placeholder="e.g., GSTIN verified on portal: name mismatch with applicant PAN."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger">
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
