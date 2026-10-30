/* ============================================================
   TradeLink — Shop Query Keys
   ============================================================ */

export const shopQueryKeys = {
  all: ['shop'],
  categories: () => ['shop', 'categories'],
  sellers: () => ['shop', 'sellers'],
  seller: (id) => ['shop', 'sellers', id],
  products: (filters) => ['shop', 'products', filters || {}],
  product: (id) => ['shop', 'products', id],
  relatedProducts: (id, categoryId) => ['shop', 'products', 'related', id, categoryId],
  cart: (consumerId) => ['shop', 'cart', consumerId],
  orders: (consumerId, status) => ['shop', 'orders', consumerId, status || 'all'],
  order: (orderId) => ['shop', 'orders', 'detail', orderId],
  rfqs: (consumerId) => ['shop', 'rfqs', consumerId],
  wishlist: (consumerId) => ['shop', 'wishlist', consumerId],
  alerts: (consumerId) => ['shop', 'alerts', consumerId],
};

