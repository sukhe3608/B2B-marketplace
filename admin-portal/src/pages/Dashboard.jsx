import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Eye, 
  RotateCcw,
  FileCheck,
  Shield,
  ArrowRight
} from 'lucide-react';
import useAdminStore from '../store/adminStore';
import ApproveModal from '../components/ApproveModal';
import RejectModal from '../components/RejectModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { requests, markUnderReview, currentAdmin } = useAdminStore();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForApprove, setSelectedForApprove] = useState(null);
  const [selectedForReject, setSelectedForReject] = useState(null);

  // Compute stats
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const underReviewCount = requests.filter(r => r.status === 'under_review').length;
  const resubmittedCount = requests.filter(r => r.status === 're_submitted').length;
  const verifiedCount = requests.filter(r => r.status === 'verified').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  // Filter requests
  const filteredRequests = requests.filter(r => {
    // Tab filter
    if (activeTab === 'pending' && !(r.status === 'pending' || r.status === 're_submitted')) return false;
    if (activeTab === 'under_review' && r.status !== 'under_review') return false;
    if (activeTab === 'verified' && r.status !== 'verified') return false;
    if (activeTab === 'rejected' && r.status !== 'rejected') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCompany = r.companyName?.toLowerCase().includes(q);
      const matchSeller = r.sellerName?.toLowerCase().includes(q);
      const matchEmail = r.email?.toLowerCase().includes(q);
      const matchGst = r.gstNumber?.toLowerCase().includes(q);
      const matchPan = r.panNumber?.toLowerCase().includes(q);
      return matchCompany || matchSeller || matchEmail || matchGst || matchPan;
    }

    return true;
  });

  const handleOpenDetail = (request) => {
    if (request.status === 'pending' || request.status === 're_submitted') {
      markUnderReview(request.id, currentAdmin?.name);
    }
    navigate(`/requests/${request.id}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="badge badge-verified"><CheckCircle2 size={12} style={{ marginRight: 4 }} /> Verified</span>;
      case 'rejected':
        return <span className="badge badge-rejected"><XCircle size={12} style={{ marginRight: 4 }} /> Rejected</span>;
      case 'under_review':
        return <span className="badge badge-under_review"><Clock size={12} style={{ marginRight: 4 }} /> In Review</span>;
      case 're_submitted':
        return <span className="badge badge-re_submitted"><RotateCcw size={12} style={{ marginRight: 4 }} /> Re-submitted</span>;
      case 'pending':
      default:
        return <span className="badge badge-pending"><AlertCircle size={12} style={{ marginRight: 4 }} /> Pending</span>;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Seller Verification Requests</h1>
          <p className="page-subtitle">
            Review business credentials, verify compliance documents, and approve or reject marketplace sellers.
          </p>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="stats-grid">
        <div 
          className="stat-card" 
          onClick={() => setActiveTab('pending')}
          style={{ cursor: 'pointer', borderColor: activeTab === 'pending' ? 'var(--warning)' : undefined }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
              <Clock size={22} />
            </div>
            {resubmittedCount > 0 && (
              <span style={{ fontSize: '11px', background: 'rgba(139,92,246,.15)', color: '#A78BFA', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                +{resubmittedCount} resubmitted
              </span>
            )}
          </div>
          <div>
            <div className="stat-card-value">{pendingCount + resubmittedCount}</div>
            <div className="stat-card-label">Pending Review</div>
          </div>
        </div>

        <div 
          className="stat-card"
          onClick={() => setActiveTab('under_review')}
          style={{ cursor: 'pointer', borderColor: activeTab === 'under_review' ? 'var(--blue)' : undefined }}
        >
          <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
            <FileCheck size={22} />
          </div>
          <div>
            <div className="stat-card-value">{underReviewCount}</div>
            <div className="stat-card-label">Currently Under Review</div>
          </div>
        </div>

        <div 
          className="stat-card"
          onClick={() => setActiveTab('verified')}
          style={{ cursor: 'pointer', borderColor: activeTab === 'verified' ? 'var(--success)' : undefined }}
        >
          <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
            <Shield size={22} />
          </div>
          <div>
            <div className="stat-card-value">{verifiedCount}</div>
            <div className="stat-card-label">Verified Sellers</div>
          </div>
        </div>

        <div 
          className="stat-card"
          onClick={() => setActiveTab('rejected')}
          style={{ cursor: 'pointer', borderColor: activeTab === 'rejected' ? 'var(--danger)' : undefined }}
        >
          <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
            <XCircle size={22} />
          </div>
          <div>
            <div className="stat-card-value">{rejectedCount}</div>
            <div className="stat-card-label">Rejected / Deficient</div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        {/* Table Controls */}
        <div className="table-card-header">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Requests ({requests.length})
            </button>
            <button 
              className={`filter-tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending ({pendingCount + resubmittedCount})
            </button>
            <button 
              className={`filter-tab ${activeTab === 'under_review' ? 'active' : ''}`}
              onClick={() => setActiveTab('under_review')}
            >
              In Review ({underReviewCount})
            </button>
            <button 
              className={`filter-tab ${activeTab === 'verified' ? 'active' : ''}`}
              onClick={() => setActiveTab('verified')}
            >
              Verified ({verifiedCount})
            </button>
            <button 
              className={`filter-tab ${activeTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveTab('rejected')}
            >
              Rejected ({rejectedCount})
            </button>
          </div>

          <div className="search-box">
            <Search size={15} />
            <input 
              type="text" 
              placeholder="Search company, seller, GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Requests Table */}
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Seller & Company</th>
                <th>Tax / ID Credentials</th>
                <th>Uploaded Docs</th>
                <th>Status</th>
                <th>Submitted</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <div className="empty-state-text">No verification requests found matching your filters.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                        {req.companyName || req.sellerName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                        {req.sellerName} • {req.email}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--text)' }}>
                        GST: {req.gstNumber || '—'}
                      </div>
                      <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text3)' }}>
                        PAN: {req.panNumber || '—'}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          background: req.documents?.gst ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                          color: req.documents?.gst ? '#10B981' : 'var(--text3)',
                          fontWeight: 500
                        }}>
                          GST {req.documents?.gst ? '✓' : '✗'}
                        </span>
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          background: req.documents?.pan ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                          color: req.documents?.pan ? '#10B981' : 'var(--text3)',
                          fontWeight: 500
                        }}>
                          PAN {req.documents?.pan ? '✓' : '✗'}
                        </span>
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          background: req.documents?.kyc ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                          color: req.documents?.kyc ? '#10B981' : 'var(--text3)',
                          fontWeight: 500
                        }}>
                          KYC {req.documents?.kyc ? '✓' : '✗'}
                        </span>
                      </div>
                    </td>

                    <td>
                      {getStatusBadge(req.status)}
                    </td>

                    <td style={{ fontSize: '12.5px', color: 'var(--text2)' }}>
                      {formatDate(req.submittedAt)}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenDetail(req)}
                        >
                          <Eye size={13} />
                          <span>Review</span>
                        </button>

                        {req.status !== 'verified' && (
                          <button 
                            className="btn btn-success btn-sm"
                            title="Quick Approve"
                            onClick={() => setSelectedForApprove(req)}
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        )}

                        {req.status !== 'rejected' && (
                          <button 
                            className="btn btn-danger btn-sm"
                            title="Quick Reject"
                            onClick={() => setSelectedForReject(req)}
                          >
                            <XCircle size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selectedForApprove && (
        <ApproveModal 
          request={selectedForApprove}
          onClose={() => setSelectedForApprove(null)}
        />
      )}

      {selectedForReject && (
        <RejectModal 
          request={selectedForReject}
          onClose={() => setSelectedForReject(null)}
        />
      )}
    </div>
  );
}
