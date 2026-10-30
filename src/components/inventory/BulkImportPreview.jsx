/* ============================================================
   TradeLink — BulkImportPreview Component
   Displays CSV validation analysis, error table, and download
   options before importing into seller inventory.
   ============================================================ */
import { AlertCircle, CheckCircle2, Download, ArrowRight } from 'lucide-react';
import './inventory.css';

export default function BulkImportPreview({
  parsedRows = [],
  validRows = [],
  invalidRows = [],
  onConfirm,
  onDownloadErrors,
  isImporting = false,
}) {
  const totalCount = parsedRows.length;
  const validCount = validRows.length;
  const invalidCount = invalidRows.length;

  return (
    <div className="bulk-preview-container">
      {/* Metrics Summary */}
      <div className="import-stat-grid">
        <div className="import-stat-card">
          <span className="import-stat-label">Total Rows Parsed</span>
          <span className="import-stat-val">{totalCount}</span>
        </div>
        <div className="import-stat-card border-success">
          <div className="flex-row items-center gap-1">
            <CheckCircle2 size={16} color="var(--color-success, #10B981)" />
            <span className="import-stat-label">Ready to Import</span>
          </div>
          <span className="import-stat-val text-green">{validCount}</span>
        </div>
        <div className={`import-stat-card ${invalidCount > 0 ? 'border-danger' : ''}`}>
          <div className="flex-row items-center gap-1">
            <AlertCircle size={16} color={invalidCount > 0 ? 'var(--color-danger, #EF4444)' : '#94A3B8'} />
            <span className="import-stat-label">Rows with Errors</span>
          </div>
          <span className={`import-stat-val ${invalidCount > 0 ? 'text-danger' : ''}`}>{invalidCount}</span>
        </div>
      </div>

      {/* Action Row */}
      <div className="bulk-action-bar">
        {invalidCount > 0 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onDownloadErrors}
          >
            <Download size={15} />
            <span>Download Error Report ({invalidCount} rows)</span>
          </button>
        )}
        <div className="spacer" />
        <button
          type="button"
          className="btn btn-primary"
          disabled={validCount === 0 || isImporting}
          onClick={onConfirm}
        >
          <span>{isImporting ? 'Importing...' : `Confirm & Import ${validCount} Valid Products`}</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Validation breakdown table */}
      <div className="table-responsive-container mt-4">
        <table className="custom-table" aria-label="Bulk import preview table">
          <thead>
            <tr>
              <th scope="col">Row #</th>
              <th scope="col">Status</th>
              <th scope="col">Title</th>
              <th scope="col">SKU</th>
              <th scope="col">Price / Opening Stock</th>
              <th scope="col">Validation Message</th>
            </tr>
          </thead>
          <tbody>
            {parsedRows.map((item, idx) => {
              const hasError = !!item.error;
              return (
                <tr key={idx} className={hasError ? 'row-has-error' : ''}>
                  <td className="font-mono text-muted">{idx + 1}</td>
                  <td>
                    {hasError ? (
                      <span className="status-chip chip-red">
                        <AlertCircle size={12} />
                        <span>Invalid</span>
                      </span>
                    ) : (
                      <span className="status-chip chip-green">
                        <CheckCircle2 size={12} />
                        <span>Valid</span>
                      </span>
                    )}
                  </td>
                  <td className="font-medium">{item.title || '—'}</td>
                  <td className="font-mono">{item.sku || '—'}</td>
                  <td>
                    <span>₹{item.price || item.minPrice || '—'}</span>
                    <span className="text-muted ml-2">({item.openingStock || 0} units)</span>
                  </td>
                  <td className="cell-error-reason">
                    {hasError ? (
                      <span className="text-danger">{item.error}</span>
                    ) : (
                      <span className="text-muted">Passed all schema checks</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

