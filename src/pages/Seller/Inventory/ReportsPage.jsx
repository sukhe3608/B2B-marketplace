/* ============================================================
   TradeLink — ReportsPage (/seller/inventory/reports)
   Inventory reporting: Low stock list, stock valuation,
   movement audit breakdown, and top-selling SKUs with charts.
   ============================================================ */
import { useState } from 'react';
import {
  BarChart3, AlertTriangle, DollarSign, TrendingUp,
  RefreshCw, ArrowDownLeft, ArrowUpRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import DashboardShell from '../../../components/layout/DashboardShell';
import VerificationBanner from '../../../components/inventory/VerificationBanner';
import StockBadge from '../../../components/shop/StockBadge';
import { useAuth, useQuery } from '../../../hooks';
import { inventoryService } from '../../../services/inventoryService';
import { inventoryQueryKeys } from '../../../features/inventory/inventoryQueryKeys';
import { mockDb } from '../../../services/mockDb';
import './inventory-pages.css';

const REPORT_TABS = [
  { id: 'low-stock', label: 'Low Stock Report' },
  { id: 'valuation', label: 'Stock Valuation' },
  { id: 'movements', label: 'Movement Velocity' },
  { id: 'top-sellers', label: 'Top Selling SKUs' },
];

export default function ReportsPage() {
  const { user, verificationStatus } = useAuth();
  const sellerId = user?.sellerId || 'sel-001';
  const currentSeller = mockDb.findOne('sellers', (s) => s.id === sellerId);
  const effectiveStatus = (verificationStatus && verificationStatus !== 'none')
    ? verificationStatus
    : (currentSeller?.verificationStatus || 'approved');
  const [activeTab, setActiveTab] = useState('low-stock');

  // Reports queries
  const { data: lowStock = [], isLoading: loadingLow } = useQuery(
    inventoryQueryKeys.lowStockReport(sellerId),
    () => inventoryService.getLowStockReport(sellerId)
  );

  const { data: valuation = [], isLoading: loadingVal } = useQuery(
    inventoryQueryKeys.valuationReport(sellerId),
    () => inventoryService.getValuationReport(sellerId)
  );

  const { data: movementsSummary = [], isLoading: loadingMov } = useQuery(
    inventoryQueryKeys.movementSummary(sellerId, 30),
    () => inventoryService.getMovementSummary(sellerId, 30)
  );

  const { data: topSellers = [], isLoading: loadingTop } = useQuery(
    inventoryQueryKeys.topSellers(sellerId, 5),
    () => inventoryService.getTopSellers(sellerId, 5)
  );

  const totalValuation = valuation.reduce((acc, item) => acc + (item.valuation || 0), 0);

  return (
    <DashboardShell role="seller">
      <div className="inv-page-container animate-fade-in-up">
        <VerificationBanner verificationStatus={effectiveStatus} />

        <div className="inv-page-header">
          <div className="inv-header-title">
            <h1>Inventory Intelligence & Analytics</h1>
            <p>Financial valuations, replenishment alerts, fulfillment velocity, and top volume generators.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="order-status-tabs">
          {REPORT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`order-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Low Stock Alert Report */}
        {activeTab === 'low-stock' && (
          <div className="inv-section-card">
            <div className="inv-section-header">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber" />
                <h3>Replenishment Priority ({lowStock.length} SKUs)</h3>
              </div>
            </div>

            {loadingLow ? (
              <p className="p-4 text-muted">Calculating inventory thresholds...</p>
            ) : lowStock.length === 0 ? (
              <p className="p-6 text-center text-green font-semibold">No products currently at or below reorder levels.</p>
            ) : (
              <div className="table-responsive-container">
                <table className="custom-table" aria-label="Low stock report table">
                  <thead>
                    <tr>
                      <th scope="col">SKU / Product</th>
                      <th scope="col" className="text-right">Available</th>
                      <th scope="col" className="text-right">On Hand</th>
                      <th scope="col" className="text-right">Reserved</th>
                      <th scope="col" className="text-right">Reorder Threshold</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((item) => (
                      <tr key={item.id} className={item.available <= 0 ? 'product-row-out-of-stock' : 'product-row-low-stock'}>
                        <td>
                          <div className="font-semibold">{item.title}</div>
                          <div className="text-xs font-mono text-muted">{item.sku}</div>
                        </td>
                        <td className="text-right font-bold text-amber">{item.available} {item.unit}</td>
                        <td className="text-right">{item.onHand} {item.unit}</td>
                        <td className="text-right text-muted">{item.reserved} {item.unit}</td>
                        <td className="text-right font-semibold">{item.reorderLevel} {item.unit}</td>
                        <td>
                          <StockBadge stockStatus={item.stockStatus} available={item.available} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Stock Valuation Report */}
        {activeTab === 'valuation' && (
          <div>
            <div className="kpi-card mb-4 border-l-4 border-indigo-600">
              <span className="kpi-label">Total Realized Asset Valuation</span>
              <div className="kpi-value text-primary">₹{totalValuation.toLocaleString('en-IN')}</div>
              <span className="kpi-sub">Calculated using tier 1 wholesale pricing × physical on-hand units</span>
            </div>

            <div className="inv-section-card">
              <div className="inv-section-header">
                <h3>Product Stock Valuation Table</h3>
              </div>
              <div className="table-responsive-container">
                <table className="custom-table" aria-label="Stock valuation table">
                  <thead>
                    <tr>
                      <th scope="col">Product Title</th>
                      <th scope="col">SKU</th>
                      <th scope="col" className="text-right">On Hand Units</th>
                      <th scope="col" className="text-right">Unit Price (Tier 1)</th>
                      <th scope="col" className="text-right">Total Valuation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valuation.map((item) => (
                      <tr key={item.id}>
                        <td className="font-semibold">{item.title}</td>
                        <td className="font-mono text-xs">{item.sku}</td>
                        <td className="text-right">{item.onHand} {item.unit}</td>
                        <td className="text-right">₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                        <td className="text-right font-bold text-primary">
                          ₹{Number(item.valuation).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Movement Velocity (Chart) */}
        {activeTab === 'movements' && (
          <div className="inv-section-card">
            <div className="inv-section-header">
              <h3>30-Day Movement Velocity by Type</h3>
            </div>
            {loadingMov ? (
              <p className="p-4 text-muted">Aggregating ledger data...</p>
            ) : movementsSummary.length === 0 ? (
              <p className="p-4 text-muted">No movement history in the last 30 days.</p>
            ) : (
              <>
                <div className="reports-chart-wrap">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={movementsSummary} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalQty" fill="var(--color-primary, #4F46E5)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="table-responsive-container mt-4">
                  <table className="custom-table" aria-label="Movement summary table">
                    <thead>
                      <tr>
                        <th scope="col">Movement Type</th>
                        <th scope="col" className="text-right">Transaction Events</th>
                        <th scope="col" className="text-right">Total Units Shifted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movementsSummary.map((m, idx) => (
                        <tr key={idx}>
                          <td className="font-semibold capitalize">{m.type}</td>
                          <td className="text-right">{m.eventCount}</td>
                          <td className="text-right font-bold">{m.totalQty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 4: Top Selling SKUs (Chart) */}
        {activeTab === 'top-sellers' && (
          <div className="inv-section-card">
            <div className="inv-section-header">
              <h3>Top Performing SKUs by Sales Volume</h3>
            </div>
            {loadingTop ? (
              <p className="p-4 text-muted">Calculating order history...</p>
            ) : topSellers.length === 0 ? (
              <p className="p-4 text-muted">No fulfilled order volume data available yet.</p>
            ) : (
              <>
                <div className="reports-chart-wrap">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topSellers} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="title" angle={-15} textAnchor="end" height={60} interval={0} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="unitsSold" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="table-responsive-container mt-4">
                  <table className="custom-table" aria-label="Top sellers table">
                    <thead>
                      <tr>
                        <th scope="col">Product Title</th>
                        <th scope="col" className="text-right">Units Fulfilled</th>
                        <th scope="col" className="text-right">Gross Realized Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSellers.map((item, idx) => (
                        <tr key={idx}>
                          <td className="font-semibold">{item.title}</td>
                          <td className="text-right font-bold text-green">{item.unitsSold} units</td>
                          <td className="text-right font-bold">₹{Number(item.revenue || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

