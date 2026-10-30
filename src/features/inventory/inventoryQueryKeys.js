/* ============================================================
   TradeLink — Inventory Query Keys
   ============================================================ */

export const inventoryQueryKeys = {
  all: ['inventory'],
  overview: (sellerId) => ['inventory', 'overview', sellerId],
  products: (sellerId, filters) => ['inventory', 'products', sellerId, filters || {}],
  product: (id) => ['inventory', 'products', 'detail', id],
  stockLevel: (productId) => ['inventory', 'stockLevel', productId],
  movements: (sellerId, filters) => ['inventory', 'movements', sellerId, filters || {}],
  orders: (sellerId, status) => ['inventory', 'orders', sellerId, status || 'all'],
  order: (orderId) => ['inventory', 'orders', 'detail', orderId],
  rfqs: (sellerId) => ['inventory', 'rfqs', sellerId],
  lowStockReport: (sellerId) => ['inventory', 'reports', 'lowStock', sellerId],
  valuationReport: (sellerId) => ['inventory', 'reports', 'valuation', sellerId],
  movementSummary: (sellerId, days) => ['inventory', 'reports', 'movements', sellerId, days || 30],
  topSellers: (sellerId, limit) => ['inventory', 'reports', 'topSellers', sellerId, limit || 5],
};

