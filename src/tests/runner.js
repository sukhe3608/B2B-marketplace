/* ============================================================
   TradeLink — Test Runner (Zero-Dependency)
   Runs inventoryLogic, cartLogic, and crossSideFlows tests
   using Node's built-in test runner and assert.
   ============================================================ */
import assert from 'node:assert';
import {
  computeAvailable,
  computeStockStatus,
  createMovement,
  applyReserve,
  applyShip,
  applyRelease,
  applyAdjust,
  applyOpeningStock,
} from '../logic/inventoryLogic.js';

import {
  unitPrice,
  lineGST,
  lineSubtotal,
  lineTotal,
  computeLineTotals,
  validateCartLine,
  groupCartBySeller,
  revalidateCart,
  cartTotals,
} from '../logic/cartLogic.js';

import { mockDb } from '../services/mockDb.js';
import { shopService } from '../services/shopService.js';
import { inventoryService } from '../services/inventoryService.js';

console.log('🧪 Starting TradeLink Test Suite...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}\n`);
    failed++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}\n`);
    failed++;
  }
}

// ── 1. inventoryLogic Tests ─────────────────────────────────
console.log('--- 1. inventoryLogic Pure Functions ---');

test('computeAvailable calculates onHand - reserved', () => {
  assert.strictEqual(computeAvailable({ onHand: 100, reserved: 25 }), 75);
  assert.strictEqual(computeAvailable({ onHand: 10, reserved: 10 }), 0);
  assert.strictEqual(computeAvailable({}), 0);
});

test('computeStockStatus correctly identifies all 4 states', () => {
  assert.strictEqual(computeStockStatus({ trackStock: false }, {}), 'made_to_order');
  assert.strictEqual(computeStockStatus({ trackStock: true, reorderLevel: 10 }, { onHand: 0, reserved: 0 }), 'out_of_stock');
  assert.strictEqual(computeStockStatus({ trackStock: true, reorderLevel: 10 }, { onHand: 10, reserved: 2 }), 'low_stock');
  assert.strictEqual(computeStockStatus({ trackStock: true, reorderLevel: 10 }, { onHand: 50, reserved: 5 }), 'in_stock');
});

test('applyReserve reserves stock and blocks over-allocation', () => {
  const initial = { productId: 'p1', onHand: 100, reserved: 20 };
  const res = applyReserve(initial, 30);
  assert.strictEqual(res.stockLevel.reserved, 50);
  assert.strictEqual(res.movement.type, 'reserve');
  assert.strictEqual(res.movement.qty, 30);

  // Over-allocation
  assert.throws(() => applyReserve(initial, 90), /Cannot reserve 90/);
});

test('applyShip reduces onHand and reserved equally', () => {
  const initial = { productId: 'p1', onHand: 100, reserved: 30 };
  const res = applyShip(initial, 30);
  assert.strictEqual(res.stockLevel.onHand, 70);
  assert.strictEqual(res.stockLevel.reserved, 0);
  assert.strictEqual(res.movement.type, 'out');
});

test('applyRelease releases reserved stock', () => {
  const initial = { productId: 'p1', onHand: 100, reserved: 30 };
  const res = applyRelease(initial, 30);
  assert.strictEqual(res.stockLevel.reserved, 0);
  assert.strictEqual(res.stockLevel.onHand, 100);
  assert.strictEqual(res.movement.type, 'release');
});

test('applyAdjust handles restock, shrinkage, and prevents onHand < reserved', () => {
  const initial = { productId: 'p1', onHand: 50, reserved: 20 };
  const restock = applyAdjust(initial, 10, { reason: 'Delivery receipt' });
  assert.strictEqual(restock.stockLevel.onHand, 60);

  const shrinkage = applyAdjust(initial, -10, { reason: 'Water damage' });
  assert.strictEqual(shrinkage.stockLevel.onHand, 40);

  // Block reason empty
  assert.throws(() => applyAdjust(initial, 10, { reason: '' }), /Reason is required/);

  // Block below reserved
  assert.throws(() => applyAdjust(initial, -35, { reason: 'Scrap' }), /less than reserved/);
});

// ── 2. cartLogic Tests ──────────────────────────────────────
console.log('\n--- 2. cartLogic Pure Functions ---');

test('unitPrice selects correct wholesale slab tier', () => {
  const product = {
    priceSlabs: [
      { minQty: 1, price: 1000 },
      { minQty: 10, price: 900 },
      { minQty: 50, price: 800 },
    ],
  };
  assert.strictEqual(unitPrice(product, 1), 1000);
  assert.strictEqual(unitPrice(product, 9), 1000);
  assert.strictEqual(unitPrice(product, 10), 900);
  assert.strictEqual(unitPrice(product, 49), 900);
  assert.strictEqual(unitPrice(product, 50), 800);
  assert.strictEqual(unitPrice(product, 100), 800);
});

test('lineGST and lineTotal calculations', () => {
  assert.strictEqual(lineSubtotal(500, 10), 5000);
  assert.strictEqual(lineGST(500, 10, 18), 900);
  assert.strictEqual(lineTotal(500, 10, 18), 5900);
});

test('validateCartLine checks MOQ and Available constraints', () => {
  const prod = { id: 'p1', sellerId: 's1', status: 'active', moq: 10, priceSlabs: [{ minQty: 1, price: 100 }] };
  const stock = { onHand: 50, reserved: 10 }; // available = 40
  const seller = { id: 's1', verificationStatus: 'approved' };

  // Below MOQ
  const res1 = validateCartLine({ productId: 'p1', qty: 5 }, { product: prod, stockLevel: stock, seller });
  assert.strictEqual(res1.isValid, false);
  assert.ok(res1.errors.some((e) => e.code === 'BELOW_MOQ'));

  // Exceeds available
  const res2 = validateCartLine({ productId: 'p1', qty: 45 }, { product: prod, stockLevel: stock, seller });
  assert.strictEqual(res2.isValid, false);
  assert.ok(res2.errors.some((e) => e.code === 'EXCEEDS_AVAILABLE'));

  // Valid
  const res3 = validateCartLine({ productId: 'p1', qty: 20 }, { product: prod, stockLevel: stock, seller });
  assert.strictEqual(res3.isValid, true);
});

test('groupCartBySeller partitions lines by seller with totals', () => {
  const cart = [
    { productId: 'p1', sellerId: 's1', sellerName: 'Seller 1', unitPrice: 100, qty: 2, gstRate: 18, subtotal: 200, gstAmount: 36, total: 236 },
    { productId: 'p2', sellerId: 's2', sellerName: 'Seller 2', unitPrice: 500, qty: 1, gstRate: 18, subtotal: 500, gstAmount: 90, total: 590 },
  ];
  const groups = groupCartBySeller(cart);
  assert.strictEqual(groups.length, 2);
  assert.strictEqual(groups[0].totals.total, 236);
  assert.strictEqual(groups[1].totals.total, 590);
});

// ── 3. Part 4 Cross-Side Flow Integration Tests ─────────────
console.log('\n--- 3. Part 4 Cross-Side Integration Flows ---');

// Setup mock localStorage in Node environment
const storageData = {};
global.localStorage = {
  getItem: (k) => storageData[k] || null,
  setItem: (k, v) => { storageData[k] = String(v); },
  removeItem: (k) => { delete storageData[k]; },
  clear: () => { Object.keys(storageData).forEach((k) => delete storageData[k]); },
};
global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

async function runCrossSideFlows() {
  await testAsync('Flow 1: Seller adjusts stock to 0 -> customer sees out of stock, cart flagged', async () => {
    mockDb.resetDemo();
    const testProductId = 'prod-008';
    await inventoryService.adjustStock(testProductId, {
      type: 'adjust',
      qty: 0,
      reason: 'Physical count 0',
      actor: 'seller',
    });

    const updated = await shopService.getProductById(testProductId);
    assert.strictEqual(updated.stockStatus, 'out_of_stock');
    assert.strictEqual(updated.available, 0);

    const reval = revalidateCart([{ productId: testProductId, qty: 5, unitPrice: 450, flags: [] }], {
      products: mockDb.get('products'),
      stockLevels: mockDb.get('stockLevels'),
      sellers: mockDb.get('sellers'),
    });
    assert.ok(reval.revalidatedLines[0].flags.some((f) => f.code === 'OUT_OF_STOCK'));
  });

  await testAsync('Flow 2: Customer places order -> reserved increases, available decreases', async () => {
    mockDb.resetDemo();
    const testProductId = 'prod-003';
    const before = await inventoryService.getStockLevel(testProductId);
    const order = await shopService.placeOrder('consumer-1', {
      sellerId: 'seller-001',
      lines: [{ productId: testProductId, title: 'Helmet', qty: 5, unitPrice: 250 }],
      address: { city: 'Pune' },
    });

    assert.strictEqual(order.status, 'placed');
    const after = await inventoryService.getStockLevel(testProductId);
    assert.strictEqual(after.reserved, before.reserved + 5);
  });

  await testAsync('Flow 3: Seller confirms and ships -> onHand and reserved reduced', async () => {
    mockDb.resetDemo();
    const testProductId = 'prod-003';
    const order = await shopService.placeOrder('consumer-1', {
      sellerId: 'seller-001',
      lines: [{ productId: testProductId, title: 'Helmet', qty: 5, unitPrice: 250 }],
      address: { city: 'Pune' },
    });

    const stockBefore = await inventoryService.getStockLevel(testProductId);
    await inventoryService.confirmOrder(order.id);
    await inventoryService.shipOrder(order.id);

    const stockAfter = await inventoryService.getStockLevel(testProductId);
    assert.strictEqual(stockAfter.onHand, stockBefore.onHand - 5);
    assert.strictEqual(stockAfter.reserved, stockBefore.reserved - 5);
  });

  await testAsync('Flow 4: Customer cancels order -> reservation released', async () => {
    mockDb.resetDemo();
    const testProductId = 'prod-005';
    const before = await inventoryService.getStockLevel(testProductId);
    const order = await shopService.placeOrder('consumer-1', {
      sellerId: 'seller-001',
      lines: [{ productId: testProductId, title: 'Fittings', qty: 5, unitPrice: 150 }],
      address: { city: 'Mumbai' },
    });

    await shopService.cancelOrder(order.id, 'Change of plans');
    const after = await inventoryService.getStockLevel(testProductId);
    assert.strictEqual(after.reserved, before.reserved);
  });

  await testAsync('Flow 5: Seller archives product -> disappears from customer shop', async () => {
    mockDb.resetDemo();
    const testProductId = 'prod-007';
    await inventoryService.archiveProduct(testProductId);

    const catalog = await shopService.getProducts();
    assert.ok(!catalog.products.some((p) => p.id === testProductId));
  });

  await testAsync('Flow 6: Customer RFQ -> Seller replies with quote', async () => {
    mockDb.resetDemo();
    const rfq = await shopService.createRFQ({
      productId: 'prod-011',
      consumerId: 'cons-1',
      sellerId: 'seller-003',
      qty: 100,
      message: 'Need 100 units',
    });
    assert.strictEqual(rfq.status, 'open');

    const replied = await inventoryService.replyRFQ(rfq.id, {
      quotedPrice: 750,
      quotedMessage: 'Quotation approved',
    });
    assert.strictEqual(replied.status, 'quoted');
    assert.strictEqual(replied.quotedPrice, 750);
  });

  await testAsync('Flow 7: Seller restocks -> product status switches to in_stock', async () => {
    mockDb.resetDemo();
    const testProductId = 'prod-004'; // out of stock initially
    await inventoryService.adjustStock(testProductId, {
      type: 'in',
      qty: 50,
      reason: 'Batch arrival',
      actor: 'seller',
    });

    const prod = await shopService.getProductById(testProductId);
    assert.strictEqual(prod.stockStatus, 'in_stock');
    assert.strictEqual(prod.available, 50);
  });

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runCrossSideFlows();

