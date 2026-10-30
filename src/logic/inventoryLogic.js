/* ============================================================
   TradeLink — inventoryLogic.js
   Pure stock-mutation functions. No imports, no side-effects.
   Every stock change goes through these functions.
   Unit-tested in inventoryLogic.test.js
   ============================================================ */

/**
 * computeAvailable — derived, never stored.
 */
export function computeAvailable(stockLevel) {
  return (stockLevel.onHand ?? 0) - (stockLevel.reserved ?? 0);
}

/**
 * computeStockStatus — derived, never stored.
 * @returns {'made_to_order'|'out_of_stock'|'low_stock'|'in_stock'}
 */
export function computeStockStatus(product, stockLevel) {
  if (!product.trackStock) return 'made_to_order';
  const available = computeAvailable(stockLevel);
  if (available <= 0) return 'out_of_stock';
  if (available <= product.reorderLevel) return 'low_stock';
  return 'in_stock';
}

/**
 * createMovement — builds a movement record (does NOT persist).
 */
export function createMovement({ type, qty, reason, refType = null, refId = null, actor = 'system', productId }) {
  return {
    id:        'mov-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    productId,
    type,      // in | out | adjust | reserve | release | return
    qty,       // always positive; direction implied by type
    reason,
    refType,
    refId,
    actor,
    createdAt: new Date().toISOString(),
  };
}

/**
 * applyReserve — reserves qty for an order.
 * Throws if qty > available.
 * Returns { stockLevel, movement } — caller must persist both.
 */
export function applyReserve(stockLevel, qty, { reason = 'Order placed', refType = 'order', refId = null, actor = 'system' } = {}) {
  const available = computeAvailable(stockLevel);
  if (qty > available) {
    throw new Error(
      `Cannot reserve ${qty} — only ${available} available (onHand: ${stockLevel.onHand}, reserved: ${stockLevel.reserved}).`
    );
  }
  const next = { ...stockLevel, reserved: stockLevel.reserved + qty };
  const movement = createMovement({ type: 'reserve', qty, reason, refType, refId, actor, productId: stockLevel.productId });
  return { stockLevel: next, movement };
}

/**
 * applyShip — deducts onHand and reserved when seller ships.
 * Both go down by qty (assumed already reserved).
 * Throws if qty > onHand.
 */
export function applyShip(stockLevel, qty, { reason = 'Order shipped', refType = 'order', refId = null, actor = 'system' } = {}) {
  if (qty > stockLevel.onHand) {
    throw new Error(
      `Cannot ship ${qty} — only ${stockLevel.onHand} onHand.`
    );
  }
  if (qty > stockLevel.reserved) {
    throw new Error(
      `Cannot ship ${qty} — only ${stockLevel.reserved} reserved.`
    );
  }
  const next = {
    ...stockLevel,
    onHand:   stockLevel.onHand   - qty,
    reserved: stockLevel.reserved - qty,
  };
  const movement = createMovement({ type: 'out', qty, reason, refType, refId, actor, productId: stockLevel.productId });
  return { stockLevel: next, movement };
}

/**
 * applyRelease — releases a reservation (cancel / reject).
 * reserved goes down by qty; onHand unchanged.
 * Throws if qty > reserved.
 */
export function applyRelease(stockLevel, qty, { reason = 'Reservation released', refType = 'order', refId = null, actor = 'system' } = {}) {
  if (qty > stockLevel.reserved) {
    throw new Error(
      `Cannot release ${qty} — only ${stockLevel.reserved} reserved.`
    );
  }
  const next = { ...stockLevel, reserved: stockLevel.reserved - qty };
  const movement = createMovement({ type: 'release', qty, reason, refType, refId, actor, productId: stockLevel.productId });
  return { stockLevel: next, movement };
}

/**
 * applyAdjust — manual adjustment (in/out/adjust).
 * delta can be positive (stock in) or negative (stock out).
 * Throws if result < reserved (can't adjust below reserved).
 */
export function applyAdjust(stockLevel, delta, { reason, actor = 'system' } = {}) {
  if (!reason || reason.trim() === '') {
    throw new Error('Reason is required for stock adjustments.');
  }
  const nextOnHand = stockLevel.onHand + delta;
  if (nextOnHand < 0) {
    throw new Error(
      `Adjustment would make onHand negative (${nextOnHand}). Not allowed.`
    );
  }
  if (nextOnHand < stockLevel.reserved) {
    throw new Error(
      `Adjustment would make onHand (${nextOnHand}) less than reserved (${stockLevel.reserved}). Release reservations first.`
    );
  }
  const next = { ...stockLevel, onHand: nextOnHand };
  const movement = createMovement({
    type:      delta >= 0 ? 'in' : 'out',
    qty:       Math.abs(delta),
    reason,
    refType:   'adjust',
    refId:     null,
    actor,
    productId: stockLevel.productId,
  });
  return { stockLevel: next, movement };
}

/**
 * applyReturn — customer returns stock (onHand goes up).
 */
export function applyReturn(stockLevel, qty, { reason = 'Customer return', refType = 'order', refId = null, actor = 'system' } = {}) {
  if (qty <= 0) throw new Error('Return quantity must be positive.');
  const next = { ...stockLevel, onHand: stockLevel.onHand + qty };
  const movement = createMovement({ type: 'return', qty, reason, refType, refId, actor, productId: stockLevel.productId });
  return { stockLevel: next, movement };
}

/**
 * applyOpeningStock — used when a product is first created with trackStock=true.
 * Equivalent to a manual 'in' with reason "Opening stock".
 */
export function applyOpeningStock(stockLevel, qty, actor = 'system') {
  if (qty < 0) throw new Error('Opening stock cannot be negative.');
  const next = { ...stockLevel, onHand: qty };
  const movement = createMovement({
    type: 'in', qty, reason: 'Opening stock', refType: 'manual', refId: null, actor, productId: stockLevel.productId,
  });
  return { stockLevel: next, movement };
}

