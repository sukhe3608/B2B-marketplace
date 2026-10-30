/* ============================================================
   TradeLink — mockDb.js
   Shared localStorage mock database.
   Only this file (and the two service files) touches localStorage.
   All other components go through the service layer.
   ============================================================ */

import sellersJson      from '../mocks/sellers.json' with { type: 'json' };
import categoriesJson   from '../mocks/categories.json' with { type: 'json' };
import productsJson     from '../mocks/products.json' with { type: 'json' };
import stockLevelsJson  from '../mocks/stockLevels.json' with { type: 'json' };
import movementsJson    from '../mocks/stockMovements.json' with { type: 'json' };
import ordersJson       from '../mocks/orders.json' with { type: 'json' };
import rfqsJson         from '../mocks/rfqs.json' with { type: 'json' };

/* ── Table → localStorage key map ─────────────────────────── */
const KEYS = {
  sellers:        'tl_sellers',
  categories:     'tl_categories',
  products:       'tl_products',
  stockLevels:    'tl_stockLevels',
  stockMovements: 'tl_stockMovements',
  orders:         'tl_orders',
  rfqs:           'tl_rfqs',
  wishlists:      'tl_wishlists',
  carts:          'tl_carts',
  alerts:         'tl_alerts',
};

const SEED_MAP = {
  sellers:        sellersJson,
  categories:     categoriesJson,
  products:       productsJson,
  stockLevels:    stockLevelsJson,
  stockMovements: movementsJson,
  orders:         ordersJson,
  rfqs:           rfqsJson,
  wishlists:      [],
  carts:          [],
  alerts:         [],
};

const SEED_FLAG_KEY = 'tl_seeded_v2';
const CHANGE_EVENT  = 'mockdb:change';

/* ── Internal helpers ──────────────────────────────────────── */
const memoryStorage = {};

function getStorage() {
  if (typeof localStorage !== 'undefined') return localStorage;
  return {
    getItem: (k) => memoryStorage[k] || null,
    setItem: (k, v) => { memoryStorage[k] = String(v); },
    removeItem: (k) => { delete memoryStorage[k]; },
    clear: () => { Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]); },
  };
}

function safeRead(key) {
  try {
    const raw = getStorage().getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function safeWrite(key, value) {
  try {
    getStorage().setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

function emit(table) {
  try {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent(CHANGE_EVENT, { detail: { table, entity: table } })
      );
    }
  } catch (e) {
    /* silent */
  }
}

/* ── Seed on first run ─────────────────────────────────────── */
function seed() {
  if (safeRead(SEED_FLAG_KEY)) return; // already seeded
  for (const [table, data] of Object.entries(SEED_MAP)) {
    safeWrite(KEYS[table], data);
  }
  safeWrite(SEED_FLAG_KEY, true);
}

seed();

/* ── Cross-tab sync ────────────────────────────────────────── */
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('storage', (e) => {
    // Find which table changed by matching the key
    const table = Object.entries(KEYS).find(([, k]) => k === e.key)?.[0];
    if (table) emit(table);
  });
}

/* ── Public API ────────────────────────────────────────────── */

/**
 * get(table) — returns the full array for a table.
 */
export function get(table) {
  const key = KEYS[table];
  if (!key) { console.warn('[mockDb] unknown table:', table); return []; }
  return safeRead(key) ?? [];
}

/**
 * set(table, data) — replaces the full array.
 */
export function set(table, data) {
  const key = KEYS[table];
  if (!key) { console.warn('[mockDb] unknown table:', table); return; }
  safeWrite(key, data);
  emit(table);
}

/**
 * update(table, id, patch) — shallow-merges patch into the record with matching id.
 * Returns the updated record, or null if not found.
 */
export function update(table, id, patch) {
  const rows = get(table);
  let updated = null;
  const next = rows.map((r) => {
    const rid = r.id ?? r.productId; // stockLevels use productId as PK
    if (rid === id) {
      updated = { ...r, ...patch };
      return updated;
    }
    return r;
  });
  if (!updated) { console.warn('[mockDb] update: id not found', id, 'in', table); return null; }
  set(table, next);
  return updated;
}

/**
 * insert(table, record) — appends a record.
 */
export function insert(table, record) {
  const rows = get(table);
  set(table, [...rows, record]);
  return record;
}

/**
 * remove(table, id) — removes a record by id.
 */
export function remove(table, id) {
  const rows = get(table);
  set(table, rows.filter((r) => (r.id ?? r.productId) !== id));
}

/**
 * findOne(table, predicate) — returns first matching record.
 */
export function findOne(table, predicate) {
  return get(table).find(predicate) ?? null;
}

/**
 * resetDemo() — clears all tl_* keys and re-seeds.
 * Also clears Redux persist key so cart/wishlist reset too.
 */
export function resetDemo() {
  try {
    const store = getStorage();
    // Remove seed flag so seed() re-runs
    store.removeItem(SEED_FLAG_KEY);
    // Clear all table keys
    for (const key of Object.values(KEYS)) {
      store.removeItem(key);
    }
    // Clear Redux persist
    store.removeItem('tl_redux');
    // Re-seed
    seed();
    // Emit change for all tables so React Query re-fetches
    for (const table of Object.keys(KEYS)) emit(table);
    console.info('[mockDb] Demo data reset complete.');
  } catch (e) {
    console.error('[mockDb] resetDemo error', e);
  }
}

export { CHANGE_EVENT };
export const mockDb = { get, set, update, insert, remove, findOne, resetDemo };
export default mockDb;

