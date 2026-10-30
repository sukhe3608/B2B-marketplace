/* ============================================================
   TradeLink — crossSideFlows.test.js
   Integration tests validating all 7 Part 4 cross-side flows
   between the Customer Shop and Seller Inventory store.
   ============================================================ */
import { describe, it, expect, beforeEach } from 'vitest';
import { mockDb } from '../../services/mockDb';
import { shopService } from '../../services/shopService';
import { inventoryService } from '../../services/inventoryService';
import { computeAvailable, computeStockStatus } from '../../logic/inventoryLogic';
import { revalidateCart } from '../../logic/cartLogic';

describe('Part 4: Cross-Side Flow Integration Tests', () => {
  beforeEach(() => {
    // Reset to fresh demo data before each flow
    mockDb.resetDemo();
  });

  // Flow 1: Seller adjusts stock to 0
  it('Flow 1: Seller adjusts stock to 0 -> customer sees out of stock badge, Add disabled, cart flagged', async () => {
    const testProductId = 'prod-008'; // initially in_stock with 0 reserved
    const sellerId = 'seller-002';

    // Verify initial state
    const initialProduct = await shopService.getProductById(testProductId);
    expect(initialProduct.stockStatus).toBe('in_stock');
    expect(initialProduct.available).toBeGreaterThan(0);

    // Initial cart with this product
    const initialCart = [
      {
        productId: testProductId,
        sellerId,
        title: initialProduct.title,
        qty: initialProduct.moq,
        unitPrice: initialProduct.priceSlabs[0].price,
        flags: [],
      },
    ];

    // Seller performs count adjustment to 0 (or delta to 0)
    const stockLevel = await inventoryService.getStockLevel(testProductId);
    await inventoryService.adjustStock(testProductId, {
      type: 'adjust',
      qty: 0,
      reason: 'Physical warehouse count shows 0 on hand',
      actor: 'seller',
    });

    // Customer side: Check updated product
    const updatedProduct = await shopService.getProductById(testProductId);
    expect(updatedProduct.available).toBe(0);
    expect(updatedProduct.stockStatus).toBe('out_of_stock');

    // Customer side: Revalidate cart line
    const { revalidatedLines, hasChanges } = revalidateCart(initialCart, {
      products: mockDb.get('products'),
      stockLevels: mockDb.get('stockLevels'),
      sellers: mockDb.get('sellers'),
    });

    expect(hasChanges).toBe(true);
    expect(revalidatedLines[0].flags.some((f) => f.code === 'OUT_OF_STOCK')).toBe(true);

    // Seller side: Product table stockStatus is out_of_stock
    const sellerProduct = await inventoryService.getProductById(testProductId);
    expect(sellerProduct.stockStatus).toBe('out_of_stock');

    // Seller side: Appears in low stock / out of stock overview
    const overview = await inventoryService.getInventoryOverview(sellerId);
    expect(overview.outOfStockCount).toBeGreaterThan(0);
  });

  // Flow 2: Customer places order
  it('Flow 2: Customer places order -> order Placed, reserved increased, available decreased', async () => {
    const testProductId = 'prod-003';
    const sellerId = 'seller-001';
    const consumerId = 'consumer-test';

    const stockBefore = await inventoryService.getStockLevel(testProductId);
    const availableBefore = stockBefore.onHand - stockBefore.reserved;
    const orderQty = 10;

    // Customer places order
    const order = await shopService.placeOrder(consumerId, {
      sellerId,
      lines: [
        {
          productId: testProductId,
          title: 'Safety Helmet',
          sku: 'HLM-ISI-001',
          qty: orderQty,
          unitPrice: 250,
          gstRate: 18,
        },
      ],
      address: { name: 'Acme Infra', street: 'Industrial Estate', city: 'Pune', pincode: '411001' },
      paymentMethod: 'cod',
    });

    // Customer sees order in placed status
    expect(order.id).toBeDefined();
    expect(order.status).toBe('placed');

    // Check stock reservation
    const stockAfter = await inventoryService.getStockLevel(testProductId);
    expect(stockAfter.reserved).toBe(stockBefore.reserved + orderQty);
    expect(stockAfter.onHand - stockAfter.reserved).toBe(availableBefore - orderQty);

    // Seller sees incoming order in their orders list
    const sellerOrders = await inventoryService.getSellerOrders(sellerId, 'placed');
    expect(sellerOrders.some((o) => o.id === order.id)).toBe(true);
  });

  // Flow 3: Seller confirms and ships
  it('Flow 3: Seller confirms and ships -> onHand and reserved reduced, out movement logged', async () => {
    const testProductId = 'prod-003';
    const sellerId = 'seller-001';
    const consumerId = 'consumer-test';
    const orderQty = 5;

    // Place an order first
    const order = await shopService.placeOrder(consumerId, {
      sellerId,
      lines: [{ productId: testProductId, title: 'Safety Helmet', qty: orderQty, unitPrice: 250 }],
      address: { name: 'Acme Infra', city: 'Pune' },
    });

    const stockBeforeShip = await inventoryService.getStockLevel(testProductId);

    // Seller confirms
    const confirmedOrder = await inventoryService.confirmOrder(order.id);
    expect(confirmedOrder.status).toBe('confirmed');

    // Seller ships
    const shippedOrder = await inventoryService.shipOrder(order.id);
    expect(shippedOrder.status).toBe('shipped');

    // On-hand and reserved both decrease by orderQty
    const stockAfterShip = await inventoryService.getStockLevel(testProductId);
    expect(stockAfterShip.onHand).toBe(stockBeforeShip.onHand - orderQty);
    expect(stockAfterShip.reserved).toBe(stockBeforeShip.reserved - orderQty);

    // Out movement logged in ledger
    const movements = await inventoryService.getMovements(sellerId, { productId: testProductId, type: 'out' });
    expect(movements.some((m) => m.refType === 'order' && m.refId === order.id && m.qty === orderQty)).toBe(true);

    // Customer sees timeline update
    const consumerOrder = await shopService.getConsumerOrderById(order.id);
    expect(consumerOrder.timeline.some((e) => e.status === 'shipped')).toBe(true);
  });

  // Flow 4: Seller rejects or customer cancels
  it('Flow 4: Customer cancels order -> reservation released, release movement logged', async () => {
    const testProductId = 'prod-005';
    const sellerId = 'seller-001';
    const consumerId = 'consumer-test';
    const orderQty = 10;

    const stockBefore = await inventoryService.getStockLevel(testProductId);

    // Place order
    const order = await shopService.placeOrder(consumerId, {
      sellerId,
      lines: [{ productId: testProductId, title: 'Pipe Fittings', qty: orderQty, unitPrice: 150 }],
      address: { name: 'Constro Corp', city: 'Mumbai' },
    });

    const stockReserved = await inventoryService.getStockLevel(testProductId);
    expect(stockReserved.reserved).toBe(stockBefore.reserved + orderQty);

    // Customer cancels order
    const cancelled = await shopService.cancelOrder(order.id, 'Duplicate purchase order');
    expect(cancelled.status).toBe('cancelled');

    // Reserved stock released back to 0
    const stockAfterCancel = await inventoryService.getStockLevel(testProductId);
    expect(stockAfterCancel.reserved).toBe(stockBefore.reserved);
    expect(stockAfterCancel.onHand).toBe(stockBefore.onHand);

    // Release movement logged
    const movements = await inventoryService.getMovements(sellerId, { productId: testProductId, type: 'release' });
    expect(movements.some((m) => m.refId === order.id && m.qty === orderQty)).toBe(true);
  });

  // Flow 5: Seller archives a product
  it('Flow 5: Seller archives product -> disappears from customer shop, cart line flagged', async () => {
    const testProductId = 'prod-007';
    const sellerId = 'seller-002';

    // Product is initially visible in shop
    const shopListBefore = await shopService.getProducts({ q: 'Rubber Conveyor' });
    expect(shopListBefore.products.some((p) => p.id === testProductId)).toBe(true);

    // In customer cart
    const cart = [{ productId: testProductId, sellerId, qty: 5, unitPrice: 1200, flags: [] }];

    // Seller archives product
    await inventoryService.archiveProduct(testProductId);

    // Customer shop: product disappears
    const shopListAfter = await shopService.getProducts({ q: 'Rubber Conveyor' });
    expect(shopListAfter.products.some((p) => p.id === testProductId)).toBe(false);

    // Customer cart: revalidate flags archived status
    const { revalidatedLines } = revalidateCart(cart, {
      products: mockDb.get('products'),
      stockLevels: mockDb.get('stockLevels'),
      sellers: mockDb.get('sellers'),
    });
    expect(revalidatedLines[0].flags.some((f) => f.code === 'ARCHIVED')).toBe(true);

    // Seller product table: shows in archived filter
    const archivedSellerProds = await inventoryService.getSellerProducts(sellerId, { status: 'archived' });
    expect(archivedSellerProds.products.some((p) => p.id === testProductId)).toBe(true);
  });

  // Flow 6: Customer requests quote (RFQ) -> Seller replies
  it('Flow 6: Customer requests quote -> seller replies with price -> customer converts to cart', async () => {
    const testProductId = 'prod-011'; // made to order product
    const sellerId = 'seller-003';
    const consumerId = 'consumer-enterprise';

    // Customer requests quote
    const rfq = await shopService.createRFQ({
      productId: testProductId,
      consumerId,
      sellerId,
      qty: 100,
      message: 'Need 100 customized units with delivery in 2 weeks',
    });

    expect(rfq.status).toBe('open');

    // Seller sees RFQ in their list
    const sellerRFQs = await inventoryService.getSellerRFQs(sellerId);
    expect(sellerRFQs.some((r) => r.id === rfq.id)).toBe(true);

    // Seller replies with quoted price
    const quotedRate = 720;
    const repliedRFQ = await inventoryService.replyRFQ(rfq.id, {
      quotedPrice: quotedRate,
      quotedMessage: 'Quotation approved for 100 units.',
    });

    expect(repliedRFQ.status).toBe('quoted');
    expect(repliedRFQ.quotedPrice).toBe(quotedRate);

    // Customer checks their RFQ list
    const customerRFQs = await shopService.getConsumerRFQs(consumerId);
    const myQuote = customerRFQs.find((r) => r.id === rfq.id);
    expect(myQuote.status).toBe('quoted');
    expect(myQuote.quotedPrice).toBe(quotedRate);
  });

  // Flow 7: Restock alerts
  it('Flow 7: Seller restocks product with alerts set -> restock logged and alert state maintained', async () => {
    const testProductId = 'prod-004'; // out of stock product in seed data
    const consumerId = 'consumer-alert-user';

    // Consumer enables alert
    await shopService.setAlert(consumerId, testProductId, true);
    const alerts = await shopService.getAlerts(consumerId);
    expect(alerts[testProductId]).toBe(true);

    // Seller restocks the product
    await inventoryService.adjustStock(testProductId, {
      type: 'in',
      qty: 50,
      reason: 'Supplier replenishment container arrival',
      actor: 'seller',
    });

    // Stock level is now 50 available
    const stockAfter = await inventoryService.getStockLevel(testProductId);
    expect(stockAfter.onHand).toBe(50);
    expect(computeAvailable(stockAfter)).toBe(50);

    // Movement was logged
    const movements = await inventoryService.getMovements('seller-001', { productId: testProductId, type: 'in' });
    expect(movements.some((m) => m.qty === 50)).toBe(true);

    // Customer product view now shows in_stock
    const shopProd = await shopService.getProductById(testProductId);
    expect(shopProd.stockStatus).toBe('in_stock');
    expect(shopProd.available).toBe(50);
  });
});

