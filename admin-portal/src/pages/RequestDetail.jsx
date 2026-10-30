import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle,
  RotateCcw,
  Building,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  UserCheck
} from 'lucide-react';
import useAdminStore, { REJECTION_ITEMS } from '../store/adminStore';
import ApproveModal from '../components/ApproveModal';
import RejectModal from '../components/RejectModal';
import DocumentViewerModal from '../components/DocumentViewerModal';

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, currentAdmin } = useAdminStore();

  const request = getById(id);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null); // { doc, title }

  if (!request) {
    return (
      <div className="admin-page">
        <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to Queue
        </button>
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <AlertTriangle size={48} color="var(--warning)" style={{ margin: '0 auto 12px' }} />
          <h3>Verification Request Not Found</h3>
          <p style={{ color: 'var(--text2)', marginTop: '8px' }}>
            The requested verification file ID <code>{id}</code> does not exist in local data.
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="badge badge-verified"><CheckCircle2 size={12} style={{ marginRight: 4 }} /> Verified Seller</span>;
      case 'rejected':
        return <span className="badge badge-rejected"><XCircle size={12} style={{ marginRight: 4 }} /> Rejected / Action Needed</span>;
      case 'under_review':
        return <span className="badge badge-under_review"><Clock size={12} style={{ marginRight: 4 }} /> In Review</span>;
      case 're_submitted':
        return <span className="badge badge-re_submitted"><RotateCcw size={12} style={{ marginRight: 4 }} /> Re-submitted by Seller</span>;
      case 'pending':
      default:
        return <span className="badge badge-pending"><Clock size={12} style={{ marginRight: 4 }} /> Pending Initial Review</span>;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // Find rejection labels for rejected items
  const flaggedReasons = (request.rejectedItems || []).map(itemId => {
    const found = REJECTION_ITEMS.find(item => item.id === itemId);
    return found ? found.label : itemId;
  });

  return (
    <div className="admin-page">
      {/* Top back navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
          <ArrowLeft size={14} /> Back to Requests Queue
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Request ID:</span>
          <code style={{ fontSize: '12px', background: 'var(--surface2)', padding: '2px 8px', borderRadius: '4px' }}>
            {request.id}
          </code>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800 }}>{request.companyName || request.sellerName}</h1>
            {getStatusBadge(request.status)}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text2)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span>Applicant: <strong>{request.sellerName}</strong></span>
            <span>Email: <strong>{request.email}</strong></span>
            <span>Phone: <strong>{request.phone || 'N/A'}</strong></span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-success"
            onClick={() => setShowApproveModal(true)}
          >
            <CheckCircle2 size={16} />
            <span>Approve & Verify</span>
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => setShowRejectModal(true)}
          >
            <XCircle size={16} />
            <span>Reject / Request Changes</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Business details & documents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Statutory Credentials */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={16} color="var(--primary2)" />
              Statutory Business Identifiers
            </h3>

            <div className="detail-grid">
              <div className="detail-field">
                <span className="detail-field-label">GSTIN / Registration Number</span>
                <span className="detail-field-value" style={{ fontFamily: 'monospace', fontSize: '15px', color: 'var(--primary2)' }}>
                  {request.gstNumber || 'Not provided'}
                </span>
              </div>

              <div className="detail-field">
                <span className="detail-field-label">PAN Number</span>
                <span className="detail-field-value" style={{ fontFamily: 'monospace', fontSize: '15px' }}>
                  {request.panNumber || 'Not provided'}
                </span>
              </div>

              <div className="detail-field">
                <span className="detail-field-label">Registered Legal Name</span>
                <span className="detail-field-value">{request.companyName || '—'}</span>
              </div>

              <div className="detail-field">
                <span className="detail-field-label">Submission Date</span>
                <span className="detail-field-value">{formatDate(request.submittedAt)}</span>
              </div>
            </div>
          </div>

          {/* Uploaded Documents */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} color="var(--primary2)" />
              Uploaded Compliance Documents
            </h3>

            <div className="doc-list">
              {/* GST Document */}
              <div className="doc-item">
                <div className="doc-item-icon" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary2)' }}>
                  <FileText size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="doc-item-name">GST Registration Certificate</div>
                  <div className="doc-item-status">
                    {request.documents?.gst ? 'Document Attached (300 DPI scan)' : 'Missing document'}
                  </div>
                </div>
                {request.documents?.gst ? (
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setViewingDoc({ doc: request.documents.gst, title: 'GST Registration Certificate' })}
                  >
                    <ExternalLink size={13} /> View Document
                  </button>
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>Not Provided</span>
                )}
              </div>

              {/* PAN Document */}
              <div className="doc-item">
                <div className="doc-item-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>
                  <CreditCard size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="doc-item-name">Company / Proprietor PAN Card</div>
                  <div className="doc-item-status">
                    {request.documents?.pan ? 'Document Attached' : 'Missing document'}
                  </div>
                </div>
                {request.documents?.pan ? (
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setViewingDoc({ doc: request.documents.pan, title: 'PAN Card Document' })}
                  >
                    <ExternalLink size={13} /> View Document
                  </button>
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>Not Provided</span>
                )}
              </div>

              {/* KYC Document */}
              <div className="doc-item">
                <div className="doc-item-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                  <ShieldCheck size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="doc-item-name">Identity / Address KYC Proof</div>
                  <div className="doc-item-status">
                    {request.documents?.kyc ? 'Document Attached' : 'Missing document'}
                  </div>
                </div>
                {request.documents?.kyc ? (
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setViewingDoc({ doc: request.documents.kyc, title: 'KYC Document' })}
                  >
                    <ExternalLink size={13} /> View Document
                  </button>
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>Not Provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Resubmission History if any */}
          {request.resubmissionHistory && request.resubmissionHistory.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={16} color="#A78BFA" />
                Resubmission Audit Trail ({request.resubmissionHistory.length})
              </h3>
              <div className="timeline">
                {request.resubmissionHistory.map((hist, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-line"></div>
                    <div className="timeline-dot" style={{ background: '#A78BFA' }}></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Seller Resubmitted Application</div>
                      <div className="timeline-time">{formatDate(hist.submittedAt)}</div>
                      {hist.rejectionNote && (
                        <div style={{ fontSize: '12px', background: 'var(--surface2)', padding: '8px 12px', borderRadius: '6px', marginTop: '6px', color: 'var(--text2)' }}>
                          <strong>Previous Feedback given to seller:</strong> {hist.rejectionNote}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Review Status, Marked Deficiencies, Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Current Review State */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
              Review Decision & Status
            </h3>

            {request.status === 'verified' && (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 700, marginBottom: '6px' }}>
                  <ShieldCheck size={18} />
                  <span>Approved & Verified Seller</span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text2)' }}>
                  Verified by <strong>{request.reviewerName || 'Admin'}</strong> on {formatDate(request.reviewedAt)}.
                </div>
                {request.reviewerNotes && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text3)' }}>
                    Notes: {request.reviewerNotes}
                  </div>
                )}
              </div>
            )}

            {request.status === 'rejected' && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: 700, marginBottom: '8px' }}>
                  <XCircle size={18} />
                  <span>Marked Rejected / Deficient</span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text2)', marginBottom: '8px' }}>
                  Rejected by <strong>{request.reviewerName || 'Admin'}</strong> on {formatDate(request.reviewedAt)}.
                </div>

                {flaggedReasons.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Marked Rejection Reasons:
                    </div>
                    <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: '#F87171' }}>
                      {flaggedReasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {request.rejectionNote && (
                  <div style={{ marginTop: '10px', fontSize: '12.5px', color: 'var(--text)' }}>
                    <strong>Feedback to seller:</strong> "{request.rejectionNote}"
                  </div>
                )}
              </div>
            )}

            {/* Quick action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn btn-success"
                style={{ width: '100%', height: '42px' }}
                onClick={() => setShowApproveModal(true)}
              >
                <CheckCircle2 size={16} />
                <span>{request.status === 'verified' ? 'Re-confirm Approval' : 'Approve Verification'}</span>
              </button>

              <button 
                className="btn btn-danger"
                style={{ width: '100%', height: '42px' }}
                onClick={() => setShowRejectModal(true)}
              >
                <XCircle size={16} />
                <span>{request.status === 'rejected' ? 'Update Rejection Reasons' : 'Reject Verification Request'}</span>
              </button>
            </div>
          </div>

          {/* Guidelines card */}
          <div className="card" style={{ background: 'var(--surface2)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
              Compliance Review Protocol
            </h4>
            <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text2)', lineHeight: '1.6' }}>
              <li>Cross-reference the 15-digit GSTIN with the legal company name.</li>
              <li>Confirm PAN entity type matches business structure (Proprietorship vs Pvt Ltd).</li>
              <li>If images are illegible, mark <strong>"GST/PAN blurry"</strong> so seller receives a clear re-verification prompt.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showApproveModal && (
        <ApproveModal 
          request={request}
          onClose={() => setShowApproveModal(false)}
        />
      )}

      {showRejectModal && (
        <RejectModal 
          request={request}
          onClose={() => setShowRejectModal(false)}
        />
      )}

      {viewingDoc && (
        <DocumentViewerModal 
          doc={viewingDoc.doc}
          title={viewingDoc.title}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </div>
  );
}
