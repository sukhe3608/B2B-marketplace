/* ============================================================
   TradeLink — inventoryService.js
   Seller-facing read + write operations.
   ALL mockDb access for inventory is here.
   ============================================================ */
import db from './mockDb.js';
import {
  computeAvailable, computeStockStatus,
  applyAdjust, applyShip, applyRelease, applyOpeningStock,
  createMovement,
} from '../logic/inventoryLogic.js';

/* ── Delay helper ──────────────────────────────────────────── */
function delay(ms = 300 + Math.random() * 300) {
  return new Promise((res) => setTimeout(res, ms));
}

/* ── Helpers ───────────────────────────────────────────────── */
function enrichProduct(product, stockLevels) {
  const sl     = stockLevels.find((s) => s.productId === product.id) ?? { productId: product.id, onHand: 0, reserved: 0 };
  const status = computeStockStatus(product, sl);
  const avail  = computeAvailable(sl);
  return { ...product, stockLevel: sl, stockStatus: status, available: avail };
}

/* ── Product CRUD ──────────────────────────────────────────── */
export async function getSellerProducts(sellerId, filters = {}) {
  await delay();
  const stockLevels = db.get('stockLevels');
  let products = db.get('products').filter((p) => p.sellerId === sellerId);

  const { status, stockStatus, categoryId, q, sort = 'title', page = 1, pageSize = 20 } = filters;

  if (status && status !== 'all')      products = products.filter((p) => p.status === status);
  if (categoryId && categoryId !== 'all') products = products.filter((p) => p.categoryId === categoryId);
  if (q) {
    const q_lc = q.toLowerCase();
    products = products.filter((p) => p.title.toLowerCase().includes(q_lc) || p.sku.toLowerCase().includes(q_lc));
  }

  let enriched = products.map((p) => enrichProduct(p, stockLevels));

  if (stockStatus && stockStatus !== 'all') {
    enriched = enriched.filter((p) => p.stockStatus === stockStatus);
  }

  if (sort === 'title')           enriched.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'available_asc')   enriched.sort((a, b) => a.available - b.available);
  if (sort === 'available_desc')  enriched.sort((a, b) => b.available - a.available);
  if (sort === 'createdAt')       enriched.sort((a, b) => new Date(b.id) - new Date(a.id));

  const total = enriched.length;
  const start = (page - 1) * pageSize;
  return { items: enriched.slice(start, start + pageSize), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getProductById(id) {
  await delay();
  const product = db.get('products').find((p) => p.id === id);
  if (!product) return null;
  return enrichProduct(product, db.get('stockLevels'));
}

export async function createProduct(sellerId, data) {
  await delay(500);
  const id = 'prod-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5);
  const product = {
    id, sellerId,
    categoryId:   data.categoryId,
    title:        data.title,
    description:  data.description ?? '',
    images:       data.images ?? [],
    sku:          data.sku ?? id,
    unit:         data.unit ?? 'Piece',
    moq:          data.moq ?? 1,
    gstRate:      data.gstRate ?? 18,
    leadTimeDays: data.leadTimeDays ?? 7,
    trackStock:   data.trackStock ?? true,
    reorderLevel: data.reorderLevel ?? 0,
    priceSlabs:   data.priceSlabs ?? [],
    status:       data.status ?? 'draft',
  };
  db.insert('products', product);

  // Create opening stock level + movement
  if (product.trackStock) {
    const sl = { productId: id, onHand: data.openingStock ?? 0, reserved: 0 };
    const { movement } = applyOpeningStock(sl, data.openingStock ?? 0, sellerId);
    db.insert('stockLevels', sl);
    if ((data.openingStock ?? 0) > 0) db.insert('stockMovements', movement);
  }

  return product;
}

export async function updateProduct(id, patch) {
  await delay(400);
  const products = db.get('products');
  const idx      = products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Product not found.');
  const updated = { ...products[idx], ...patch };
  products[idx] = updated;
  db.set('products', products);
  return updated;
}

export async function archiveProduct(id) {
  await delay(400);
  return updateProduct(id, { status: 'archived' });
}

/* ── Stock operations ──────────────────────────────────────── */
export async function getStockLevel(productId) {
  await delay();
  return db.get('stockLevels').find((s) => s.productId === productId) ?? null;
}

export async function adjustStock(productId, { type, qty, reason, actor = 'system' }) {
  await delay(400);
  const stockLevels = db.get('stockLevels');
  const slIdx       = stockLevels.findIndex((s) => s.productId === productId);
  if (slIdx === -1) throw new Error('Stock level not found for product: ' + productId);

  const sl = stockLevels[slIdx];
  let result;

  if (type === 'in') {
    result = applyAdjust(sl, +qty, { reason, actor });
  } else if (type === 'out') {
    result = applyAdjust(sl, -qty, { reason, actor });
  } else if (type === 'adjust') {
    // New physical count override: delta = target - current onHand
    const delta = qty - sl.onHand;
    result = applyAdjust(sl, delta, { reason, actor });
  } else {
    throw new Error('Unknown adjustment type: ' + type);
  }

  stockLevels[slIdx] = result.stockLevel;
  db.set('stockLevels', stockLevels);
  db.insert('stockMovements', result.movement);

  // Check alerts — notify consumers watching this product
  const alerts = db.get('alerts').filter((a) => a.productId === productId && a.enabled);
  if (alerts.length > 0 && type === 'in') {
    // Increment notification count in a simple key
    const note = { productId, at: new Date().toISOString(), alertCount: alerts.length };
    try {
      const existing = JSON.parse(localStorage.getItem('tl_back_in_stock_notes') ?? '[]');
      existing.push(note);
      localStorage.setItem('tl_back_in_stock_notes', JSON.stringify(existing));
    } catch { /* silent */ }
  }

  return { stockLevel: result.stockLevel, movement: result.movement };
}

export async function getMovements(filters = {}) {
  await delay();
  let movements = db.get('stockMovements');
  const { productId, sellerId, type, dateFrom, dateTo, page = 1, pageSize = 50 } = filters;

  if (productId && productId !== 'all') {
    movements = movements.filter((m) => m.productId === productId);
  }

  if (sellerId) {
    const sellerProductIds = db.get('products').filter((p) => p.sellerId === sellerId).map((p) => p.id);
    movements = movements.filter((m) => sellerProductIds.includes(m.productId));
  }

  if (type && type !== 'all')    movements = movements.filter((m) => m.type === type);
  if (dateFrom) movements = movements.filter((m) => m.createdAt >= dateFrom);
  if (dateTo)   movements = movements.filter((m) => m.createdAt <= dateTo);

  // Sort newest first
  movements = [...movements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Enrich with product title
  const products = db.get('products');
  const enriched = movements.map((m) => ({
    ...m,
    product: products.find((p) => p.id === m.productId) ?? null,
  }));

  const total = enriched.length;
  const start = (page - 1) * pageSize;
  return { items: enriched.slice(start, start + pageSize), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

/* ── Bulk import ───────────────────────────────────────────── */
export async function bulkImportProducts(rows, sellerId) {
  await delay(600);
  const results = { success: 0, failed: 0, errors: [] };
  const products = db.get('products');
  const stockLevels = db.get('stockLevels');
  const movements = db.get('stockMovements');

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row._valid) {
      results.failed++;
      results.errors.push({ row: i + 1, errors: row._errors });
      continue;
    }
    const id = 'prod-imp-' + Date.now() + '-' + i;
    const product = {
      id, sellerId,
      categoryId:   row.categoryId,
      title:        row.title,
      description:  row.description ?? '',
      images:       [],
      sku:          row.sku ?? id,
      unit:         row.unit ?? 'Piece',
      moq:          Number(row.moq) || 1,
      gstRate:      Number(row.gstRate) || 18,
      leadTimeDays: Number(row.leadTimeDays) || 7,
      trackStock:   String(row.trackStock).toLowerCase() !== 'false',
      reorderLevel: Number(row.reorderLevel) || 0,
      priceSlabs:   row._priceSlabs ?? [],
      status:       'draft',
    };
    products.push(product);
    if (product.trackStock) {
      const qty = Number(row.openingStock) || 0;
      const sl  = { productId: id, onHand: qty, reserved: 0 };
      stockLevels.push(sl);
      if (qty > 0) {
        movements.push(createMovement({ type: 'in', qty, reason: 'Opening stock (bulk import)', refType: 'manual', refId: null, actor: sellerId, productId: id }));
      }
    }
    results.success++;
  }

  db.set('products', products);
  db.set('stockLevels', stockLevels);
  db.set('stockMovements', movements);
  return results;
}

/* ── Orders ────────────────────────────────────────────────── */
export async function getSellerOrders(sellerId, filters = {}) {
  await delay();
  const products = db.get('products');
  let orders = db.get('orders').filter((o) => !sellerId || o.sellerId === sellerId);

  if (filters.status && filters.status !== 'all') {
    orders = orders.filter((o) => o.status === filters.status);
  }

  return orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((o) => ({
      ...o,
      lines: (o.lines || []).map((l) => {
        const prod = products.find((p) => p.id === l.productId);
        return {
          ...l,
          product: prod ?? null,
          title: l.title || prod?.title || 'Product Item',
          sku: l.sku || prod?.sku || '',
          images: l.images || prod?.images || [],
          image: l.image || l.images?.[0] || prod?.images?.[0] || '',
        };
      }),
    }));
}

export async function getSellerOrderById(orderId, sellerId) {
  await delay();
  const products = db.get('products');
  const order    = db.get('orders').find((o) => o.id === orderId && (!sellerId || o.sellerId === sellerId));
  if (!order) return null;
  return {
    ...order,
    lines: (order.lines || []).map((l) => {
      const prod = products.find((p) => p.id === l.productId);
      return {
        ...l,
        product: prod ?? null,
        title: l.title || prod?.title || 'Product Item',
        sku: l.sku || prod?.sku || '',
        images: l.images || prod?.images || [],
        image: l.image || l.images?.[0] || prod?.images?.[0] || '',
      };
    }),
  };
}

function pushTimeline(order, status, note) {
  return { ...order, status, timeline: [...order.timeline, { status, at: new Date().toISOString(), note }] };
}

export async function confirmOrder(orderId, maybeSellerId) {
  await delay(400);
  const orders = db.get('orders');
  const idx    = orders.findIndex((o) => o.id === orderId && (!maybeSellerId || o.sellerId === maybeSellerId));
  if (idx === -1) throw new Error('Order not found.');
  if (orders[idx].status !== 'placed') throw new Error('Only placed orders can be confirmed.');
  orders[idx] = pushTimeline(orders[idx], 'confirmed', 'Confirmed by seller');
  db.set('orders', orders);
  return orders[idx];
}

export async function shipOrder(orderId, maybeSellerId) {
  await delay(400);
  const orders      = db.get('orders');
  const idx         = orders.findIndex((o) => o.id === orderId && (!maybeSellerId || o.sellerId === maybeSellerId));
  if (idx === -1) throw new Error('Order not found.');
  if (orders[idx].status !== 'confirmed') throw new Error('Only confirmed orders can be shipped.');

  const order       = orders[idx];
  const sellerId    = maybeSellerId || order.sellerId;
  const stockLevels = db.get('stockLevels');
  const movements   = db.get('stockMovements');
  const products    = db.get('products');

  for (const line of order.lines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product?.trackStock) continue;
    const slIdx = stockLevels.findIndex((s) => s.productId === line.productId);
    if (slIdx === -1) continue;
    const { stockLevel: nextSl, movement } = applyShip(stockLevels[slIdx], line.qty, {
      reason: `Order ${orderId} shipped`, refType: 'order', refId: orderId, actor: sellerId,
    });
    stockLevels[slIdx] = nextSl;
    movements.push(movement);
  }

  db.set('stockLevels', stockLevels);
  db.set('stockMovements', movements);
  orders[idx] = pushTimeline(order, 'shipped', 'Shipped by seller');
  db.set('orders', orders);
  return orders[idx];
}

export async function deliverOrder(orderId, maybeSellerId) {
  await delay(400);
  const orders = db.get('orders');
  const idx    = orders.findIndex((o) => o.id === orderId && (!maybeSellerId || o.sellerId === maybeSellerId));
  if (idx === -1) throw new Error('Order not found.');
  if (orders[idx].status !== 'shipped') throw new Error('Only shipped orders can be marked delivered.');
  orders[idx] = pushTimeline(orders[idx], 'delivered', 'Marked delivered by seller');
  db.set('orders', orders);
  return orders[idx];
}

export async function rejectOrder(orderId, reasonOrSellerId, maybeReason) {
  await delay(400);
  const reason = (typeof maybeReason === 'string' && maybeReason) ? maybeReason : (typeof reasonOrSellerId === 'string' ? reasonOrSellerId : 'Rejected by seller');
  const sellerId = (typeof maybeReason === 'string' && typeof reasonOrSellerId === 'string') ? reasonOrSellerId : null;
  if (!reason?.trim()) throw new Error('Rejection reason is required.');

  const orders = db.get('orders');
  const idx    = orders.findIndex((o) => o.id === orderId && (!sellerId || o.sellerId === sellerId));
  if (idx === -1) throw new Error('Order not found.');
  if (orders[idx].status !== 'placed') throw new Error('Only placed orders can be rejected.');

  const order       = orders[idx];
  const actor       = sellerId || order.sellerId;
  const stockLevels = db.get('stockLevels');
  const movements   = db.get('stockMovements');
  const products    = db.get('products');

  for (const line of order.lines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product?.trackStock) continue;
    const slIdx = stockLevels.findIndex((s) => s.productId === line.productId);
    if (slIdx === -1) continue;
    const { stockLevel: nextSl, movement } = applyRelease(stockLevels[slIdx], line.qty, {
      reason: `Order ${orderId} rejected: ${reason}`, refType: 'order', refId: orderId, actor,
    });
    stockLevels[slIdx] = nextSl;
    movements.push(movement);
  }

  db.set('stockLevels', stockLevels);
  db.set('stockMovements', movements);
  orders[idx] = pushTimeline({ ...order, cancelReason: reason }, 'rejected', `Rejected: ${reason}`);
  db.set('orders', orders);
  return orders[idx];
}

/* ── RFQs ──────────────────────────────────────────────────── */
export async function getSellerRFQs(sellerId) {
  await delay();
  const rfqs     = db.get('rfqs').filter((r) => r.sellerId === sellerId);
  const products = db.get('products');
  return rfqs.map((r) => ({ ...r, product: products.find((p) => p.id === r.productId) ?? null }));
}

export async function replyRFQ(rfqId, { quotedPrice, quotedMessage }) {
  await delay(400);
  const rfqs = db.get('rfqs');
  const idx  = rfqs.findIndex((r) => r.id === rfqId);
  if (idx === -1) throw new Error('RFQ not found.');
  rfqs[idx] = { ...rfqs[idx], status: 'quoted', quotedPrice, quotedMessage, updatedAt: new Date().toISOString() };
  db.set('rfqs', rfqs);
  return rfqs[idx];
}

/* ── Reports ───────────────────────────────────────────────── */
export async function getInventoryOverview(sellerId) {
  await delay();
  const products    = db.get('products').filter((p) => p.sellerId === sellerId);
  const stockLevels = db.get('stockLevels');
  const orders      = db.get('orders').filter((o) => o.sellerId === sellerId);
  const movements   = db.get('stockMovements');
  const sellerProductIds = products.map((p) => p.id);

  let totalSKUs = 0, lowStock = 0, outOfStock = 0, stockValue = 0;
  const lowStockList = [];

  for (const product of products) {
    if (product.status === 'archived') continue;
    totalSKUs++;
    const sl     = stockLevels.find((s) => s.productId === product.id) ?? { productId: product.id, onHand: 0, reserved: 0 };
    const status = computeStockStatus(product, sl);
    const avail  = computeAvailable(sl);
    const price  = product.priceSlabs?.[0]?.price ?? 0;
    stockValue  += sl.onHand * price;

    if (status === 'out_of_stock') outOfStock++;
    if (status === 'low_stock') {
      lowStock++;
      lowStockList.push({ ...product, stockLevel: sl, stockStatus: status, available: avail });
    }
  }

  const recentMovements = [...movements]
    .filter((m) => sellerProductIds.includes(m.productId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map((m) => ({ ...m, product: products.find((p) => p.id === m.productId) ?? null }));

  const pendingOrders = orders.filter((o) => o.status === 'placed').length;

  return { totalSKUs, lowStock, outOfStock, stockValue: Math.round(stockValue), lowStockList, recentMovements, pendingOrders };
}

export async function getLowStockReport(sellerId) {
  await delay();
  const products    = db.get('products').filter((p) => p.sellerId === sellerId && p.status === 'active');
  const stockLevels = db.get('stockLevels');
  return products
    .map((p) => {
      const sl     = stockLevels.find((s) => s.productId === p.id) ?? { productId: p.id, onHand: 0, reserved: 0 };
      const status = computeStockStatus(p, sl);
      return { ...p, stockLevel: sl, stockStatus: status, available: computeAvailable(sl) };
    })
    .filter((p) => p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock');
}

export async function getValuationReport(sellerId) {
  await delay();
  const products    = db.get('products').filter((p) => p.sellerId === sellerId && p.status !== 'draft');
  const stockLevels = db.get('stockLevels');
  let total = 0;
  const rows = products.map((p) => {
    const sl    = stockLevels.find((s) => s.productId === p.id) ?? { productId: p.id, onHand: 0, reserved: 0 };
    const price = p.priceSlabs?.[0]?.price ?? 0;
    const value = sl.onHand * price;
    total += value;
    return { ...p, onHand: sl.onHand, unitPrice: price, value: Math.round(value) };
  });
  return { rows, total: Math.round(total) };
}

export async function getMovementSummary(sellerId) {
  await delay();
  const sellerProductIds = db.get('products').filter((p) => p.sellerId === sellerId).map((p) => p.id);
  const movements = db.get('stockMovements').filter((m) => sellerProductIds.includes(m.productId));
  const byType    = {};
  for (const m of movements) {
    byType[m.type] = (byType[m.type] ?? 0) + m.qty;
  }
  return byType;
}

export async function getTopSellers(sellerId) {
  await delay();
  const products = db.get('products').filter((p) => p.sellerId === sellerId);
  const orders   = db.get('orders').filter((o) => o.sellerId === sellerId && o.status !== 'cancelled' && o.status !== 'rejected');
  const qtyMap   = {};
  for (const order of orders) {
    for (const line of order.lines) {
      qtyMap[line.productId] = (qtyMap[line.productId] ?? 0) + line.qty;
    }
  }
  return products
    .map((p) => ({ ...p, totalSold: qtyMap[p.id] ?? 0 }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 10);
}

export const inventoryService = {
  getSellerProducts,
  getProductById,
  createProduct,
  updateProduct,
  archiveProduct,
  getStockLevel,
  adjustStock,
  getMovements,
  bulkImportProducts,
  getSellerOrders,
  getSellerOrderById,
  confirmOrder,
  shipOrder,
  deliverOrder,
  rejectOrder,
  getSellerRFQs,
  replyRFQ,
  getInventoryOverview,
  getLowStockReport,
  getValuationReport,
  getMovementSummary,
  getTopSellers,
};
export default inventoryService;

