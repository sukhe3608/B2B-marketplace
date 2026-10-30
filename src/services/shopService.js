/* ============================================================
   TradeLink — shopService.js
   Consumer-facing read (and write) operations.
   ALL mockDb access is here — components never import JSON or mockDb directly.
   ============================================================ */
import db from './mockDb.js';
import { computeAvailable, computeStockStatus } from '../logic/inventoryLogic.js';

/* ── Delay helper: 300–600 ms artificial latency ───────────── */
function delay(ms = 300 + Math.random() * 300) {
  return new Promise((res) => setTimeout(res, ms));
}

/* ── Internal helpers ──────────────────────────────────────── */
function enrichProduct(product, stockLevels) {
  const sl     = stockLevels.find((s) => s.productId === product.id) ?? { productId: product.id, onHand: 0, reserved: 0 };
  const status = computeStockStatus(product, sl);
  const avail  = computeAvailable(sl);
  return { ...product, stockLevel: sl, stockStatus: status, available: avail };
}

function isVisibleToShop(product, sellers) {
  if (product.status !== 'active') return false;
  const seller = sellers.find((s) => s.id === product.sellerId);
  return seller?.verificationStatus === 'approved';
}

/* ── Category API ──────────────────────────────────────────── */
export async function getCategories() {
  await delay();
  return db.get('categories');
}

/* ── Seller API ────────────────────────────────────────────── */
export async function getSellers() {
  await delay();
  return db.get('sellers').filter((s) => s.verificationStatus === 'approved');
}

export async function getSellerById(id) {
  await delay();
  return db.get('sellers').find((s) => s.id === id) ?? null;
}

/* ── Product API ───────────────────────────────────────────── */
export async function getProducts(filters = {}) {
  await delay();
  const sellers     = db.get('sellers');
  const stockLevels = db.get('stockLevels');
  let   products    = db.get('products').filter((p) => isVisibleToShop(p, sellers));

  const { categoryId, q, city, verifiedOnly, minPrice, maxPrice, availability, sort = 'relevance', page = 1, pageSize = 20 } = filters;

  if (categoryId) {
    // Include sub-categories
    const categories = db.get('categories');
    const parentIds  = categories.filter((c) => c.id === categoryId || c.parentId === categoryId).map((c) => c.id);
    products = products.filter((p) => parentIds.includes(p.categoryId));
  }

  if (q) {
    const q_lc = q.toLowerCase();
    products = products.filter((p) =>
      p.title.toLowerCase().includes(q_lc) ||
      p.description.toLowerCase().includes(q_lc) ||
      p.sku.toLowerCase().includes(q_lc)
    );
  }

  if (city) {
    products = products.filter((p) => {
      const seller = sellers.find((s) => s.id === p.sellerId);
      return seller?.city?.toLowerCase().includes(city.toLowerCase());
    });
  }

  if (verifiedOnly) {
    products = products.filter((p) => {
      const seller = sellers.find((s) => s.id === p.sellerId);
      return seller?.verificationStatus === 'approved';
    });
  }

  // Enrich with stock
  let enriched = products.map((p) => enrichProduct(p, stockLevels));

  if (availability) {
    enriched = enriched.filter((p) => p.stockStatus === availability);
  }

  if (minPrice !== undefined) {
    enriched = enriched.filter((p) => {
      const lowestSlab = p.priceSlabs?.[0]?.price ?? 0;
      return lowestSlab >= minPrice;
    });
  }
  if (maxPrice !== undefined) {
    enriched = enriched.filter((p) => {
      const lowestSlab = p.priceSlabs?.[0]?.price ?? 0;
      return lowestSlab <= maxPrice;
    });
  }

  // Sort
  if (sort === 'price_asc')  enriched.sort((a, b) => (a.priceSlabs?.[0]?.price ?? 0) - (b.priceSlabs?.[0]?.price ?? 0));
  if (sort === 'price_desc') enriched.sort((a, b) => (b.priceSlabs?.[0]?.price ?? 0) - (a.priceSlabs?.[0]?.price ?? 0));

  const total = enriched.length;
  const start = (page - 1) * pageSize;
  const items = enriched.slice(start, start + pageSize);

  return { products: items, items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getProductById(id) {
  await delay();
  const sellers     = db.get('sellers');
  const stockLevels = db.get('stockLevels');
  const product     = db.get('products').find((p) => p.id === id);
  if (!product) return null;
  const seller = sellers.find((s) => s.id === product.sellerId);
  return { ...enrichProduct(product, stockLevels), seller: seller ?? null };
}

export async function getRelatedProducts(productId, limit = 4) {
  await delay();
  const sellers     = db.get('sellers');
  const stockLevels = db.get('stockLevels');
  const source      = db.get('products').find((p) => p.id === productId);
  if (!source) return [];

  return db.get('products')
    .filter((p) => p.categoryId === source.categoryId && p.id !== productId && isVisibleToShop(p, sellers))
    .slice(0, limit)
    .map((p) => enrichProduct(p, stockLevels));
}

/* ── Cart API ──────────────────────────────────────────────── */
export async function getCart(consumerId) {
  await delay();
  const carts = db.get('carts');
  return carts.find((c) => c.consumerId === consumerId) ?? { consumerId, lines: [] };
}

export async function saveCart(consumerId, lines) {
  await delay();
  const carts   = db.get('carts');
  const existing = carts.findIndex((c) => c.consumerId === consumerId);
  const record   = { consumerId, lines, updatedAt: new Date().toISOString() };
  if (existing !== -1) {
    carts[existing] = record;
  } else {
    carts.push(record);
  }
  db.set('carts', carts);
}

/* ── Order API ─────────────────────────────────────────────── */
export async function placeOrder(consumerId, orderDataOrGroups, maybeAddress, maybePaymentMode) {
  await delay(500);
  const orders  = db.get('orders');
  const newOrders = [];

  let groupsList = [];
  if (Array.isArray(orderDataOrGroups)) {
    groupsList = orderDataOrGroups;
  } else if (orderDataOrGroups && Array.isArray(orderDataOrGroups.lines)) {
    groupsList = [orderDataOrGroups];
  } else if (orderDataOrGroups && typeof orderDataOrGroups === 'object') {
    groupsList = Object.entries(orderDataOrGroups).map(([sellerId, g]) => ({
      ...g,
      sellerId: g.sellerId || sellerId,
    }));
  }

  for (const group of groupsList) {
    const sellerId = group.sellerId;
    const groupLines = group.lines || [];
    const orderAddress = group.address || maybeAddress;
    const paymentMode = group.paymentMethod || group.paymentMode || maybePaymentMode || 'cod';

    // Re-validate stock at placement time
    const stockLevels = db.get('stockLevels');
    const products    = db.get('products');
    const sellers     = db.get('sellers');
    const movements   = db.get('stockMovements');

    for (const line of groupLines) {
      const product = products.find((p) => p.id === line.productId);
      const seller = sellers.find((s) => s.id === (product?.sellerId || sellerId));
      if (!product || product.status !== 'active') throw new Error(`Product ${line.productId} is no longer available.`);
      if (!seller || (seller.verificationStatus !== 'approved' && seller.verificationStatus !== 'verified')) {
        throw new Error(`Seller for product ${line.productId} is not approved.`);
      }

      if (product.trackStock) {
        const sl = stockLevels.find((s) => s.productId === product.id);
        const available = sl ? (sl.onHand - sl.reserved) : 0;
        if (line.qty > available) throw new Error(`Insufficient stock for "${product.title}". Only ${available} available.`);
      }
    }

    // Build order
    const orderId = 'ord-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5);
    const lines = groupLines.map((l) => {
      const prod = products.find((p) => p.id === l.productId);
      const uPrice = l.unitPrice ?? (prod?.priceSlabs?.[0]?.price || 0);
      const gRate = l.gstRate ?? prod?.gstRate ?? 18;
      const sub = l.subtotal ?? (uPrice * l.qty);
      const gstAmt = l.gstAmount ?? l.gst ?? ((sub * gRate) / 100);
      const tot = l.total ?? (sub + gstAmt);

      return {
        productId: l.productId,
        title: l.title || prod?.title || 'Product',
        sku: l.sku || prod?.sku || '',
        images: l.images || prod?.images || [],
        image: l.image || l.images?.[0] || prod?.images?.[0] || '',
        qty: l.qty,
        unitPrice: uPrice,
        gstRate: gRate,
        subtotal: sub,
        gstAmount: gstAmt,
        total: tot,
      };
    });

    const calculatedSubtotal = lines.reduce((acc, l) => acc + (l.subtotal || (l.unitPrice * l.qty)), 0);
    const calculatedGst = lines.reduce((acc, l) => acc + (l.gstAmount || ((l.unitPrice * l.qty * (l.gstRate || 0)) / 100)), 0);
    const calculatedTotal = parseFloat((calculatedSubtotal + calculatedGst).toFixed(2));

    const subtotal = group.subtotal ?? group.totals?.subtotal ?? calculatedSubtotal;
    const gst = group.gst ?? group.gstAmount ?? group.totals?.gstAmount ?? calculatedGst;
    const grand = group.total ?? group.totals?.grandTotal ?? calculatedTotal;

    const order = {
      id: orderId, consumerId, sellerId,
      lines,
      totals: { subtotal, gst, grand, total: grand, grandTotal: grand, gstAmount: gst },
      status: 'placed',
      address: orderAddress, paymentMode,
      createdAt: new Date().toISOString(),
      timeline: [
        { status: 'placed', timestamp: new Date().toISOString(), at: new Date().toISOString(), note: 'Order placed by consumer' }
      ],
    };

    // Reserve stock for each tracked line
    const updatedStockLevels = [...stockLevels];
    const updatedMovements   = [...movements];

    for (const line of lines) {
      const product = products.find((p) => p.id === line.productId);
      if (!product?.trackStock) continue;
      const slIdx = updatedStockLevels.findIndex((s) => s.productId === line.productId);
      if (slIdx === -1) continue;
      const sl = updatedStockLevels[slIdx];
      updatedStockLevels[slIdx] = { ...sl, reserved: sl.reserved + line.qty };
      updatedMovements.push({
        id:        'mov-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        productId: line.productId,
        type:      'reserve',
        qty:       line.qty,
        reason:    `Order ${orderId} placed`,
        refType:   'order',
        refId:     orderId,
        actor:     consumerId,
        createdAt: new Date().toISOString(),
      });
    }

    db.set('stockLevels', updatedStockLevels);
    db.set('stockMovements', updatedMovements);

    orders.push(order);
    newOrders.push(order);
  }

  db.set('orders', orders);
  return newOrders.length === 1 ? newOrders[0] : newOrders;
}

export async function getConsumerOrders(consumerId, filters = {}) {
  await delay();
  const products = db.get('products');
  let orders = db.get('orders').filter((o) => !consumerId || o.consumerId === consumerId);
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
          product: prod,
          title: l.title || prod?.title || 'Product Item',
          sku: l.sku || prod?.sku || '',
          images: l.images || prod?.images || [],
          image: l.image || l.images?.[0] || prod?.images?.[0] || '',
        };
      }),
    }));
}

export async function getConsumerOrderById(orderId, consumerId) {
  await delay();
  const products = db.get('products');
  const o = db.get('orders').find((ord) => ord.id === orderId && (!consumerId || ord.consumerId === consumerId));
  if (!o) return null;
  return {
    ...o,
    lines: (o.lines || []).map((l) => {
      const prod = products.find((p) => p.id === l.productId);
      return {
        ...l,
        product: prod,
        title: l.title || prod?.title || 'Product Item',
        sku: l.sku || prod?.sku || '',
        images: l.images || prod?.images || [],
        image: l.image || l.images?.[0] || prod?.images?.[0] || '',
      };
    }),
  };
}

export async function cancelOrder(orderId, reasonOrConsumerId) {
  await delay(400);
  const orders = db.get('orders');
  const order  = orders.find((o) => o.id === orderId);
  if (!order) throw new Error('Order not found.');
  if (order.status !== 'placed') throw new Error('Only "Placed" orders can be cancelled.');

  const reason = typeof reasonOrConsumerId === 'string' && reasonOrConsumerId !== order.consumerId
    ? reasonOrConsumerId
    : 'Cancelled by consumer';

  // Release stock reservations
  const stockLevels = db.get('stockLevels');
  const movements   = db.get('stockMovements');

  for (const line of order.lines) {
    const slIdx = stockLevels.findIndex((s) => s.productId === line.productId);
    if (slIdx !== -1) {
      stockLevels[slIdx] = { ...stockLevels[slIdx], reserved: Math.max(0, stockLevels[slIdx].reserved - line.qty) };
      movements.push({
        id: 'mov-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        productId: line.productId, type: 'release', qty: line.qty,
        reason: `Order ${orderId} cancelled: ${reason}`, refType: 'order', refId: orderId,
        actor: order.consumerId, createdAt: new Date().toISOString(),
      });
    }
  }

  order.status = 'cancelled';
  order.timeline.push({ status: 'cancelled', at: new Date().toISOString(), note: reason });

  db.set('stockLevels', stockLevels);
  db.set('stockMovements', movements);
  db.set('orders', orders);
  return order;
}

/* ── RFQ API ───────────────────────────────────────────────── */
export async function getConsumerRFQs(consumerId) {
  await delay();
  const rfqs    = db.get('rfqs').filter((r) => !consumerId || r.consumerId === consumerId);
  const products = db.get('products');
  const sellers  = db.get('sellers');
  return rfqs.map((r) => {
    const prod = products.find((p) => p.id === r.productId) ?? null;
    return {
      ...r,
      product: prod,
      productTitle: r.productTitle || prod?.title || `Product ${r.productId}`,
      productImage: r.productImage || prod?.images?.[0] || '',
      sku: r.sku || prod?.sku || '',
      seller: sellers.find((s) => s.id === r.sellerId) ?? null,
    };
  });
}

export async function createRFQ({ productId, consumerId, sellerId, qty, message }) {
  await delay(400);
  const rfq = {
    id:           'rfq-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
    productId, consumerId, sellerId, qty, message,
    status:       'open',
    quotedPrice:  null,
    quotedMessage: null,
    createdAt:    new Date().toISOString(),
    updatedAt:    new Date().toISOString(),
  };
  db.insert('rfqs', rfq);
  return rfq;
}

export async function convertQuoteToCart(rfqId) {
  await delay();
  const rfq = db.get('rfqs').find((r) => r.id === rfqId);
  if (!rfq || rfq.status !== 'quoted') throw new Error('RFQ is not in quoted status.');
  return { productId: rfq.productId, qty: rfq.qty, overridePrice: rfq.quotedPrice };
}

/* ── Wishlist / Alerts API ─────────────────────────────────── */
export async function getWishlist(consumerId) {
  await delay();
  const wl       = db.get('wishlists').find((w) => w.consumerId === consumerId);
  if (!wl) return { consumerId, items: [] };
  const products    = db.get('products');
  const stockLevels = db.get('stockLevels');
  const sellers     = db.get('sellers');
  const items = (wl.items ?? []).map((item) => {
    const p = products.find((pr) => pr.id === item.productId);
    return p ? { ...item, product: enrichProduct(p, stockLevels), seller: sellers.find((s) => s.id === p.sellerId) } : item;
  });
  return { ...wl, items };
}

export async function getAlerts(consumerId) {
  await delay();
  return db.get('alerts').filter((a) => a.consumerId === consumerId);
}

export async function setAlert(consumerId, productId, enabled) {
  await delay();
  const alerts = db.get('alerts');
  const idx    = alerts.findIndex((a) => a.consumerId === consumerId && a.productId === productId);
  if (idx !== -1) {
    alerts[idx].enabled = enabled;
  } else if (enabled) {
    alerts.push({ id: 'alert-' + Date.now(), consumerId, productId, enabled: true, createdAt: new Date().toISOString() });
  }
  db.set('alerts', alerts);
}

export const shopService = {
  getCategories,
  getSellers,
  getSellerById,
  getProducts,
  getProductById,
  getRelatedProducts,
  getCart,
  saveCart,
  placeOrder,
  getConsumerOrders,
  getConsumerOrderById,
  cancelOrder,
  getConsumerRFQs,
  createRFQ,
  convertQuoteToCart,
  getWishlist,
  getAlerts,
  setAlert,
};
export default shopService;

