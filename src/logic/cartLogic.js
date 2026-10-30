/* ============================================================
   TradeLink — cartLogic.js
   Pure cart / pricing functions. No imports, no side-effects.
   Unit-tested in cartLogic.test.js
   ============================================================ */

/**
 * unitPrice — returns the price of the highest slab whose minQty <= qty.
 * Falls back to the lowest slab (first) if qty < all slabs (shouldn't happen
 * in practice because MOQ is enforced, but we handle it gracefully).
 *
 * @param {Object} product — product with priceSlabs[{minQty, price}]
 * @param {number} qty
 * @returns {number}
 */
export function unitPrice(product, qty) {
  const slabs = [...(product.priceSlabs ?? [])].sort((a, b) => a.minQty - b.minQty);
  if (!slabs.length) return 0;
  let price = slabs[0].price;
  for (const slab of slabs) {
    if (qty >= slab.minQty) price = slab.price;
    else break;
  }
  return price;
}

/**
 * lineGST — GST amount for one line item (NOT included in unitPrice).
 */
export function lineGST(uPrice, qty, gstRate) {
  return parseFloat(((uPrice * qty * (gstRate ?? 0)) / 100).toFixed(2));
}

/**
 * lineSubtotal — unitPrice × qty (before GST).
 */
export function lineSubtotal(uPrice, qty) {
  return parseFloat((uPrice * qty).toFixed(2));
}

/**
 * lineTotal — subtotal + GST.
 */
export function lineTotal(uPrice, qty, gstRate) {
  const sub = lineSubtotal(uPrice, qty);
  const gst = lineGST(uPrice, qty, gstRate);
  return parseFloat((sub + gst).toFixed(2));
}

/**
 * computeLineTotals — convenience bundle for one line.
 */
export function computeLineTotals(product, qty) {
  const uPrice  = unitPrice(product, qty);
  const subtotal = lineSubtotal(uPrice, qty);
  const gst      = lineGST(uPrice, qty, product.gstRate);
  const total    = parseFloat((subtotal + gst).toFixed(2));
  return { unitPrice: uPrice, subtotal, gst, total };
}

/**
 * validateCartLine — validates qty against product rules and live stock.
 * Supports both signatures:
 *   validateCartLine(line, { product, stockLevel, seller })
 *   validateCartLine(product, stockLevel, qty, stockStatus)
 */
export function validateCartLine(firstArg, secondArg, thirdArg, fourthArg) {
  let product, stockLevel, qty, stockStatus, seller;

  if (secondArg && typeof secondArg === 'object' && ('product' in secondArg || 'stockLevel' in secondArg || 'seller' in secondArg)) {
    const line = firstArg;
    product = secondArg.product || line;
    stockLevel = secondArg.stockLevel;
    seller = secondArg.seller;
    qty = line.qty;
    const isTracked = product.trackStock !== false;
    stockStatus = product.stockStatus || (isTracked ? (stockLevel && (stockLevel.onHand - stockLevel.reserved <= 0) ? 'out_of_stock' : 'in_stock') : 'made_to_order');
  } else {
    product = firstArg;
    stockLevel = secondArg;
    qty = thirdArg;
    stockStatus = fourthArg;
  }

  const errors = [];
  const warnings = [];

  const addError = (code, message) => {
    errors.push({ code, message, toString: () => message });
  };

  if (seller && seller.verificationStatus !== 'approved' && seller.verificationStatus !== 'verified') {
    addError('SELLER_NOT_APPROVED', 'Seller is not approved. Products from this seller cannot be purchased.');
  }

  if (stockStatus === 'out_of_stock') {
    addError('OUT_OF_STOCK', 'This product is out of stock.');
  } else if (stockStatus === 'made_to_order') {
    addError('MADE_TO_ORDER', 'Made-to-order products require a quote request, not direct cart add.');
  }

  if (qty < (product?.moq ?? 1)) {
    addError('BELOW_MOQ', `Minimum order quantity is ${product.moq} ${product.unit || 'units'}. You ordered ${qty}.`);
  }

  if (product?.trackStock !== false && stockLevel) {
    const available = (stockLevel.onHand ?? 0) - (stockLevel.reserved ?? 0);
    if (qty > available) {
      addError('EXCEEDS_AVAILABLE', `Only ${available} units available. Reduce quantity.`);
    }
    if (stockStatus === 'low_stock') {
      warnings.push(`Low stock — only ${available} units remaining.`);
    }
  }

  const isValid = errors.length === 0;
  return { ok: isValid, isValid, errors, warnings };
}

/**
 * groupCartBySeller — groups cart lines by sellerId.
 * Returns array of groups (also supports Map-style lookup).
 */
export function groupCartBySeller(lines = [], products = null, sellers = null, stockLevels = null, getStockStatus = null) {
  const groupsMap = new Map();

  for (const line of lines) {
    const product = products ? products.find((p) => p.id === line.productId) : (line.product || line);
    const sellerId = line.sellerId || product?.sellerId || 'unknown';
    const seller = sellers ? sellers.find((s) => s.id === sellerId) : (line.seller || { id: sellerId, name: line.sellerName || 'Seller' });
    const stockLevel = stockLevels ? stockLevels.find((sl) => sl.productId === (line.productId || product?.id)) : line.stockLevel;
    const status = getStockStatus ? getStockStatus(product, stockLevel) : (line.stockStatus || 'in_stock');

    const uPrice = line.unitPrice ?? (product?.priceSlabs ? unitPrice(product, line.qty) : 0);
    const subtotal = line.subtotal ?? lineSubtotal(uPrice, line.qty);
    const gstRate = line.gstRate ?? product?.gstRate ?? 18;
    const gst = line.gstAmount ?? line.gst ?? lineGST(uPrice, line.qty, gstRate);
    const total = line.total ?? parseFloat((subtotal + gst).toFixed(2));

    const enrichedLine = {
      ...line,
      product: product || line,
      seller,
      stockLevel,
      stockStatus: status,
      unitPrice: uPrice,
      subtotal,
      gstAmount: gst,
      gst,
      total,
    };

    if (!groupsMap.has(sellerId)) {
      groupsMap.set(sellerId, {
        sellerId,
        seller,
        sellerName: seller?.name || line.sellerName || 'Supplier',
        sellerVerificationStatus: seller?.verificationStatus || 'approved',
        lines: [],
        totals: { subtotal: 0, gstAmount: 0, total: 0 },
        subtotal: 0,
        gst: 0,
        total: 0,
        hasFlags: false,
      });
    }

    const group = groupsMap.get(sellerId);
    group.lines.push(enrichedLine);
    group.subtotal = parseFloat((group.subtotal + subtotal).toFixed(2));
    group.gst = parseFloat((group.gst + gst).toFixed(2));
    group.total = parseFloat((group.total + total).toFixed(2));
    group.totals = {
      subtotal: group.subtotal,
      gstAmount: group.gst,
      total: group.total,
    };
    if (enrichedLine.flags?.length || enrichedLine.flag) group.hasFlags = true;
  }

  const result = Array.from(groupsMap.values());
  result.get = (id) => groupsMap.get(id);
  result.has = (id) => groupsMap.has(id);
  return result;
}

/**
 * revalidateCart — checks every line against live store data.
 * Returns updated lines with attached flags and hasChanges indicator.
 */
export function revalidateCart(lines, liveProductsOrContext, liveStockLevels, liveSellers, getStockStatus) {
  let products, stockLevels, sellers;
  if (liveProductsOrContext && typeof liveProductsOrContext === 'object' && ('products' in liveProductsOrContext || 'stockLevels' in liveProductsOrContext)) {
    products = liveProductsOrContext.products || [];
    stockLevels = liveProductsOrContext.stockLevels || [];
    sellers = liveProductsOrContext.sellers || [];
  } else {
    products = liveProductsOrContext || [];
    stockLevels = liveStockLevels || [];
    sellers = liveSellers || [];
  }

  let hasChanges = false;
  const revalidatedLines = lines.map((line) => {
    const flags = [...(line.flags || [])];
    const product = products.find((p) => p.id === line.productId);

    if (!product || product.status === 'archived' || product.status === 'draft') {
      flags.push({ code: 'ARCHIVED', type: 'unavailable', message: 'This product is no longer available in the active catalog.' });
      hasChanges = true;
      return { ...line, flags, flag: flags[0] };
    }

    const seller = sellers.find((s) => s.id === product.sellerId);
    if (!seller || (seller.verificationStatus !== 'approved' && seller.verificationStatus !== 'verified')) {
      flags.push({ code: 'SELLER_UNAPPROVED', type: 'seller_unapproved', message: 'Seller is no longer approved. Remove this item to checkout.' });
      hasChanges = true;
      return { ...line, flags, flag: flags[0] };
    }

    const stockLevel = stockLevels.find((sl) => sl.productId === product.id) ?? null;
    const available = stockLevel ? (stockLevel.onHand ?? 0) - (stockLevel.reserved ?? 0) : 999;
    const isOutOfStock = product.trackStock && available <= 0;

    if (isOutOfStock) {
      flags.push({ code: 'OUT_OF_STOCK', type: 'out_of_stock', message: 'Product is now out of stock. Remove to checkout.' });
      hasChanges = true;
      return { ...line, flags, flag: flags[0] };
    }

    const currentPrice = line.unitPrice ?? line.price;
    const livePrice = unitPrice(product, line.qty);
    if (currentPrice && livePrice !== currentPrice) {
      flags.push({ code: 'PRICE_UPDATED', type: 'price_changed', message: `Price updated: ₹${currentPrice} → ₹${livePrice}. Acknowledge to checkout.` });
      hasChanges = true;
      return { ...line, unitPrice: livePrice, flags, flag: flags[0] };
    }

    if (product.trackStock && line.qty > available) {
      flags.push({ code: 'QTY_EXCEEDED', type: 'qty_exceeded', message: `Only ${available} units available. Update quantity to checkout.` });
      hasChanges = true;
      return { ...line, flags, flag: flags[0] };
    }

    return { ...line, flags, flag: flags[0] || null };
  });

  const result = revalidatedLines;
  result.revalidatedLines = revalidatedLines;
  result.hasChanges = hasChanges;
  return result;
}

/**
 * cartTotals — sums up lines or groups into grand totals.
 */
export function cartTotals(itemsOrGroups) {
  let subtotal = 0;
  let gst = 0;
  let total = 0;

  const list = Array.isArray(itemsOrGroups)
    ? itemsOrGroups
    : (itemsOrGroups?.values ? Array.from(itemsOrGroups.values()) : Object.values(itemsOrGroups || {}));

  for (const item of list) {
    subtotal += item.subtotal || (item.totals?.subtotal || 0);
    gst += item.gstAmount || item.gst || (item.totals?.gstAmount || item.totals?.gst || 0);
    total += item.total || (item.totals?.total || 0);
  }

  const grandTotal = parseFloat((total || (subtotal + gst)).toFixed(2));
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    gst: parseFloat(gst.toFixed(2)),
    gstAmount: parseFloat(gst.toFixed(2)),
    total: grandTotal,
    grandTotal,
  };
}

