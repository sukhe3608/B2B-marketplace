/* ============================================================
   TradeLink — BulkImportPage (/seller/inventory/import)
   Bulk CSV product import with client-side parsing, row validation,
   error reports, and batch commit to inventory.
   ============================================================ */
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import VerificationBanner from '../../../components/inventory/VerificationBanner';
import BulkImportPreview from '../../../components/inventory/BulkImportPreview';
import { useAuth } from '../../../hooks';
import { inventoryService } from '../../../services/inventoryService';
import { parseCSV, unparseCSV, downloadCSV } from '../../../utils/csvHelper';
import './inventory-pages.css';

const TEMPLATE_HEADERS = [
  'title',
  'sku',
  'categoryId',
  'unit',
  'price',
  'moq',
  'openingStock',
  'reorderLevel',
  'gstRate',
  'leadTimeDays',
  'description',
];

const SAMPLE_CSV = `title,sku,categoryId,unit,price,moq,openingStock,reorderLevel,gstRate,leadTimeDays,description
"Industrial Hydraulic Hose 1/2 Inch","HOS-HYD-050","cat-001","Meters",450,10,200,30,18,3,"High pressure braided hydraulic hose for machinery"
"LED Warehouse High Bay Light 150W","LGT-BAY-150W","cat-002","Pieces",2400,5,80,15,18,2,"IP65 rated high-efficiency commercial illumination"
"Heavy Duty Corrugated Shipping Boxes","BOX-CRG-HVY","cat-004","Boxes",35,50,500,100,12,5,"5-ply export quality packaging carton"`;

import { mockDb } from '../../../services/mockDb';

export default function BulkImportPage() {
  const navigate = useNavigate();
  const { user, verificationStatus } = useAuth();
  const sellerId = user?.sellerId || 'sel-001';
  const currentSeller = mockDb.findOne('sellers', (s) => s.id === sellerId);
  const effectiveStatus = (verificationStatus && verificationStatus !== 'none')
    ? verificationStatus
    : (currentSeller?.verificationStatus || 'approved');
  const canWrite = effectiveStatus === 'verified' || effectiveStatus === 'approved';

  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [validRows, setValidRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const handleDownloadTemplate = () => {
    downloadCSV(SAMPLE_CSV, 'tradelink_product_import_template.csv');
  };

  const validateRow = (row, index) => {
    const errors = [];
    if (!row.title || !row.title.trim()) {
      errors.push('Title is required');
    }
    if (!row.sku || !row.sku.trim()) {
      errors.push('SKU is required');
    }
    const price = parseFloat(row.price);
    if (isNaN(price) || price <= 0) {
      errors.push('Valid price > 0 required');
    }
    const moq = parseInt(row.moq, 10);
    if (isNaN(moq) || moq <= 0) {
      errors.push('Valid MOQ >= 1 required');
    }

    const openingStock = parseInt(row.openingStock, 10);
    if (row.openingStock !== undefined && row.openingStock !== '' && (isNaN(openingStock) || openingStock < 0)) {
      errors.push('Opening stock cannot be negative');
    }

    return errors.length > 0 ? errors.join('; ') : null;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rawRows = parseCSV(text);

      const parsedWithValidation = rawRows.map((row, idx) => {
        const error = validateRow(row, idx);
        return {
          ...row,
          error,
          minPrice: row.price,
        };
      });

      const valids = parsedWithValidation.filter((r) => !r.error);
      const invalids = parsedWithValidation.filter((r) => !!r.error);

      setParsedRows(parsedWithValidation);
      setValidRows(valids);
      setInvalidRows(invalids);
    };
    reader.readAsText(file);
  };

  const handleDownloadErrors = () => {
    if (invalidRows.length === 0) return;
    const errorCsv = unparseCSV(invalidRows);
    downloadCSV(errorCsv, `import_errors_${Date.now()}.csv`);
  };

  const handleConfirmImport = async () => {
    if (validRows.length === 0 || !canWrite) return;
    setIsImporting(true);

    try {
      // Map valid rows to inventory schema
      const formatted = validRows.map((r) => ({
        title: r.title,
        sku: r.sku,
        categoryId: r.categoryId || 'cat-001',
        unit: r.unit || 'Pieces',
        moq: parseInt(r.moq, 10) || 1,
        openingStock: parseInt(r.openingStock, 10) || 0,
        reorderLevel: parseInt(r.reorderLevel, 10) || 10,
        gstRate: parseInt(r.gstRate, 10) || 18,
        leadTimeDays: parseInt(r.leadTimeDays, 10) || 3,
        description: r.description || '',
        priceSlabs: [{ minQty: 1, price: parseFloat(r.price) || 100 }],
        trackStock: true,
        status: 'active',
      }));

      const res = await inventoryService.bulkImportProducts(sellerId, formatted);
      setIsImporting(false);
      setImportSuccess(true);
      setImportedCount(res.imported || formatted.length);
    } catch (err) {
      setIsImporting(false);
      alert('Bulk import failed: ' + err.message);
    }
  };

  return (
    <DashboardShell role="seller">
      <div className="inv-page-container animate-fade-in-up">
        <VerificationBanner verificationStatus={effectiveStatus} />

        <div className="mb-4">
          <Link to="/seller/inventory/products" className="text-sm text-muted inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft size={14} />
            <span>Back to Products</span>
          </Link>
        </div>

        <div className="inv-page-header">
          <div className="inv-header-title">
            <h1>Bulk Product Import</h1>
            <p>Upload a standard CSV file to batch-create listings and stock balances.</p>
          </div>
          <div className="inv-header-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadTemplate}
            >
              <Download size={14} />
              <span>Download CSV Template</span>
            </button>
          </div>
        </div>

        {importSuccess ? (
          <div className="wizard-card text-center p-8">
            <CheckCircle2 size={48} className="mx-auto text-green mb-3" />
            <h2 className="font-bold text-xl mb-1">Import Completed Successfully!</h2>
            <p className="text-muted text-sm mb-6">
              {importedCount} new products and their opening inventory balances have been added to your catalog.
            </p>
            <div className="flex justify-center gap-3">
              <Link to="/seller/inventory/products" className="btn btn-primary btn-sm">
                View Product Catalog
              </Link>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setParsedRows([]);
                  setValidRows([]);
                  setInvalidRows([]);
                  setFileName('');
                  setImportSuccess(false);
                }}
              >
                Import Another File
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Upload Area */}
            {parsedRows.length === 0 && (
              <div
                className="drop-zone p-8 mb-6"
                onClick={() => fileInputRef.current?.click()}
                tabIndex="0"
                role="button"
                aria-label="Upload CSV file"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={handleFileUpload}
                />
                <UploadCloud size={40} className="upload-icon mx-auto" />
                <h3 className="upload-primary-text text-base mt-2">Click to select CSV file to import</h3>
                <p className="upload-secondary-text">Standard CSV format with title, sku, price, moq, and stock columns</p>
              </div>
            )}

            {/* Validation & Preview */}
            {parsedRows.length > 0 && (
              <div className="wizard-card">
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-primary" />
                    <span className="font-bold text-sm">{fileName}</span>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-muted hover:text-danger"
                    onClick={() => {
                      setParsedRows([]);
                      setValidRows([]);
                      setInvalidRows([]);
                      setFileName('');
                    }}
                  >
                    Clear & Upload Different File
                  </button>
                </div>

                <BulkImportPreview
                  parsedRows={parsedRows}
                  validRows={validRows}
                  invalidRows={invalidRows}
                  isImporting={isImporting}
                  onConfirm={handleConfirmImport}
                  onDownloadErrors={handleDownloadErrors}
                />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}

