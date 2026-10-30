import React from 'react';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

export default function DocumentViewerModal({ doc, title, onClose }) {
  if (!doc) return null;

  const isDataUrl = typeof doc === 'string' && doc.startsWith('data:');
  const isImage = isDataUrl && (doc.includes('image/') || doc.includes('svg'));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal" 
        style={{ maxWidth: '780px', width: '95%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--primary2)" />
            <h3 className="modal-title">{title || 'Document Viewer'}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '360px', background: '#0a0f1d' }}>
          {isImage ? (
            <div style={{ textAlign: 'center', width: '100%', overflow: 'auto', maxHeight: '520px' }}>
              <img 
                src={doc} 
                alt={title} 
                style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} 
              />
            </div>
          ) : typeof doc === 'string' && doc.startsWith('blob:') ? (
            <iframe 
              src={doc} 
              title={title} 
              style={{ width: '100%', height: '480px', border: 'none', borderRadius: '8px' }} 
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>
              <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>Document Preview</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                {typeof doc === 'string' ? doc.slice(0, 100) : 'Document object attached'}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
            Uploaded for verification review
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
