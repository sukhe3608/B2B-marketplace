/* ============================================================
   TradeLink — cartLogic.test.js
   Unit tests for wholesale tiered pricing, GST calculations,
   cart line validation, seller grouping, and live revalidation.
   ============================================================ */
import { describe, it, expect } from 'vitest';
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
} from './cartLogic';

describe('cartLogic — Pure Functions', () => {
  const sampleProduct = {
    id: 'prod-001',
    moq: 5,
    gstRate: 18,
    priceSlabs: [
      { minQty: 1, price: 1000 },
      { minQty: 10, price: 900 },
      { minQty: 50, price: 800 },
    ],
  };

  describe('unitPrice', () => {
    it('returns lowest slab price for quantities below subsequent slabs', () => {
      expect(unitPrice(sampleProduct, 1)).toBe(1000);
      expect(unitPrice(sampleProduct, 5)).toBe(1000);
      expect(unitPrice(sampleProduct, 9)).toBe(1000);
    });

    it('returns volume discounted price for intermediate slab', () => {
      expect(unitPrice(sampleProduct, 10)).toBe(900);
      expect(unitPrice(sampleProduct, 25)).toBe(900);
      expect(unitPrice(sampleProduct, 49)).toBe(900);
    });

    it('returns highest volume discount price for highest slab', () => {
      expect(unitPrice(sampleProduct, 50)).toBe(800);
      expect(unitPrice(sampleProduct, 500)).toBe(800);
    });

    it('handles single price slab product', () => {
      const singleSlab = { priceSlabs: [{ minQty: 1, price: 450 }] };
      expect(unitPrice(singleSlab, 1)).toBe(450);
      expect(unitPrice(singleSlab, 100)).toBe(450);
    });
  });

  describe('lineGST, lineSubtotal, lineTotal', () => {
    it('calculates line subtotal accurately', () => {
      expect(lineSubtotal(900, 10)).toBe(9000);
    });

    it('calculates GST at 18%', () => {
      expect(lineGST(900, 10, 18)).toBe(1620); // 9000 * 0.18
      expect(lineGST(100, 1, 12)).toBe(12);
    });

    it('calculates line total (subtotal + GST)', () => {
      expect(lineTotal(900, 10, 18)).toBe(10620);
    });

    it('bundles line totals with computeLineTotals', () => {
      const totals = computeLineTotals(sampleProduct, 10);
      expect(totals.unitPrice).toBe(900);
      expect(totals.subtotal).toBe(9000);
      expect(totals.gst).toBe(1620);
      expect(totals.total).toBe(10620);
    });
  });

  describe('validateCartLine', () => {
    const liveProduct = {
      id: 'prod-001',
      sellerId: 'seller-001',
      status: 'active',
      trackStock: true,
      moq: 10,
      priceSlabs: [{ minQty: 1, price: 500 }],
    };
    const liveStock = { productId: 'prod-001', onHand: 100, reserved: 20 }; // available = 80
    const liveSeller = { id: 'seller-001', verificationStatus: 'approved' };

    it('returns valid when constraints are satisfied', () => {
      const line = { productId: 'prod-001', qty: 15, unitPrice: 500 };
      const res = validateCartLine(line, {
        product: liveProduct,
        stockLevel: liveStock,
        seller: liveSeller,
      });
      expect(res.isValid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('flags error if requested quantity is below MOQ', () => {
      const line = { productId: 'prod-001', qty: 5, unitPrice: 500 };
      const res = validateCartLine(line, {
        product: liveProduct,
        stockLevel: liveStock,
        seller: liveSeller,
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.code === 'BELOW_MOQ')).toBe(true);
    });

    it('flags error if requested quantity exceeds available warehouse stock', () => {
      const line = { productId: 'prod-001', qty: 95, unitPrice: 500 }; // available = 80
      const res = validateCartLine(line, {
        product: liveProduct,
        stockLevel: liveStock,
        seller: liveSeller,
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.code === 'EXCEEDS_AVAILABLE')).toBe(true);
    });

    it('flags error if supplier is suspended or not approved', () => {
      const suspendedSeller = { id: 'seller-001', verificationStatus: 'suspended' };
      const line = { productId: 'prod-001', qty: 15, unitPrice: 500 };
      const res = validateCartLine(line, {
        product: liveProduct,
        stockLevel: liveStock,
        seller: suspendedSeller,
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.code === 'SELLER_NOT_APPROVED')).toBe(true);
    });
  });

  describe('groupCartBySeller', () => {
    it('groups line items under distinct seller headers with subtotals', () => {
      const cart = [
        { productId: 'p1', sellerId: 'seller-A', sellerName: 'Apex Tools', unitPrice: 100, qty: 5, gstRate: 18, subtotal: 500, gstAmount: 90, total: 590 },
        { productId: 'p2', sellerId: 'seller-A', sellerName: 'Apex Tools', unitPrice: 200, qty: 2, gstRate: 18, subtotal: 400, gstAmount: 72, total: 472 },
        { productId: 'p3', sellerId: 'seller-B', sellerName: 'Bharat Electronics', unitPrice: 50, qty: 10, gstRate: 12, subtotal: 500, gstAmount: 60, total: 560 },
      ];

      const groups = groupCartBySeller(cart);
      expect(groups).toHaveLength(2);

      const groupA = groups.find((g) => g.sellerId === 'seller-A');
      expect(groupA.lines).toHaveLength(2);
      expect(groupA.totals.subtotal).toBe(900);
      expect(groupA.totals.total).toBe(1062);

      const groupB = groups.find((g) => g.sellerId === 'seller-B');
      expect(groupB.lines).toHaveLength(1);
      expect(groupB.totals.subtotal).toBe(500);
    });
  });

  describe('revalidateCart', () => {
    it('flags price updates when live product price slab has changed', () => {
      const initialCart = [
        { productId: 'p1', sellerId: 's1', qty: 10, unitPrice: 500, flags: [] },
      ];
      const liveProducts = [
        { id: 'p1', sellerId: 's1', status: 'active', moq: 1, priceSlabs: [{ minQty: 1, price: 550 }] },
      ];
      const liveStockLevels = [{ productId: 'p1', onHand: 100, reserved: 0 }];
      const liveSellers = [{ id: 's1', verificationStatus: 'approved' }];

      const { revalidatedLines, hasChanges } = revalidateCart(initialCart, {
        products: liveProducts,
        stockLevels: liveStockLevels,
        sellers: liveSellers,
      });

      expect(hasChanges).toBe(true);
      expect(revalidatedLines[0].unitPrice).toBe(550);
      expect(revalidatedLines[0].flags.some((f) => f.code === 'PRICE_UPDATED')).toBe(true);
    });
  });

  describe('cartTotals', () => {
    it('calculates total across all items in cart', () => {
      const cart = [
        { subtotal: 1000, gstAmount: 180, total: 1180 },
        { subtotal: 2000, gstAmount: 240, total: 2240 },
      ];
      const grand = cartTotals(cart);
      expect(grand.subtotal).toBe(3000);
      expect(grand.gstAmount).toBe(420);
      expect(grand.grandTotal).toBe(3420);
    });
  });
});

