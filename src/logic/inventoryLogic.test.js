/* ============================================================
   TradeLink — inventoryLogic.test.js
   Unit tests for pure inventory mutation and status logic.
   ============================================================ */
import { describe, it, expect } from 'vitest';
import {
  computeAvailable,
  computeStockStatus,
  createMovement,
  applyReserve,
  applyShip,
  applyRelease,
  applyAdjust,
  applyReturn,
  applyOpeningStock,
} from './inventoryLogic';

describe('inventoryLogic — Pure Functions', () => {
  describe('computeAvailable', () => {
    it('returns onHand - reserved', () => {
      expect(computeAvailable({ onHand: 100, reserved: 20 })).toBe(80);
      expect(computeAvailable({ onHand: 20, reserved: 20 })).toBe(0);
      expect(computeAvailable({ onHand: 0, reserved: 0 })).toBe(0);
    });

    it('handles missing or undefined values gracefully', () => {
      expect(computeAvailable({})).toBe(0);
      expect(computeAvailable({ onHand: 50 })).toBe(50);
      expect(computeAvailable({ reserved: 10 })).toBe(-10);
    });
  });

  describe('computeStockStatus', () => {
    it('returns made_to_order if trackStock is false', () => {
      const prod = { trackStock: false, reorderLevel: 10 };
      expect(computeStockStatus(prod, { onHand: 0, reserved: 0 })).toBe('made_to_order');
      expect(computeStockStatus(prod, { onHand: 50, reserved: 10 })).toBe('made_to_order');
    });

    it('returns out_of_stock when available <= 0', () => {
      const prod = { trackStock: true, reorderLevel: 10 };
      expect(computeStockStatus(prod, { onHand: 0, reserved: 0 })).toBe('out_of_stock');
      expect(computeStockStatus(prod, { onHand: 15, reserved: 15 })).toBe('out_of_stock');
    });

    it('returns low_stock when available <= reorderLevel and available > 0', () => {
      const prod = { trackStock: true, reorderLevel: 10 };
      expect(computeStockStatus(prod, { onHand: 10, reserved: 0 })).toBe('low_stock');
      expect(computeStockStatus(prod, { onHand: 15, reserved: 8 })).toBe('low_stock'); // available = 7
    });

    it('returns in_stock when available > reorderLevel', () => {
      const prod = { trackStock: true, reorderLevel: 10 };
      expect(computeStockStatus(prod, { onHand: 50, reserved: 5 })).toBe('in_stock');
    });
  });

  describe('createMovement', () => {
    it('creates valid movement object with timestamp and unique id', () => {
      const mov = createMovement({
        type: 'in',
        qty: 50,
        reason: 'Restock batch',
        actor: 'seller',
        productId: 'prod-001',
      });
      expect(mov.id).toBeDefined();
      expect(mov.type).toBe('in');
      expect(mov.qty).toBe(50);
      expect(mov.reason).toBe('Restock batch');
      expect(mov.actor).toBe('seller');
      expect(mov.createdAt).toBeDefined();
    });
  });

  describe('applyReserve', () => {
    it('reserves stock when available is sufficient', () => {
      const initial = { productId: 'p1', onHand: 100, reserved: 10 };
      const { stockLevel, movement } = applyReserve(initial, 30, { reason: 'Order placed' });

      expect(stockLevel.reserved).toBe(40);
      expect(stockLevel.onHand).toBe(100);
      expect(movement.type).toBe('reserve');
      expect(movement.qty).toBe(30);
    });

    it('throws error when requested reservation exceeds available stock', () => {
      const initial = { productId: 'p1', onHand: 100, reserved: 80 }; // available = 20
      expect(() => applyReserve(initial, 25)).toThrow(/Cannot reserve 25/);
    });
  });

  describe('applyShip', () => {
    it('deducts onHand and reserved equally', () => {
      const initial = { productId: 'p1', onHand: 100, reserved: 40 };
      const { stockLevel, movement } = applyShip(initial, 40);

      expect(stockLevel.onHand).toBe(60);
      expect(stockLevel.reserved).toBe(0);
      expect(movement.type).toBe('out');
      expect(movement.qty).toBe(40);
    });

    it('throws if shipping quantity exceeds onHand or reserved', () => {
      const initial = { productId: 'p1', onHand: 50, reserved: 30 };
      expect(() => applyShip(initial, 40)).toThrow(/Cannot ship 40/);
    });
  });

  describe('applyRelease', () => {
    it('decreases reserved count while leaving onHand unchanged', () => {
      const initial = { productId: 'p1', onHand: 100, reserved: 30 };
      const { stockLevel, movement } = applyRelease(initial, 30);

      expect(stockLevel.reserved).toBe(0);
      expect(stockLevel.onHand).toBe(100);
      expect(movement.type).toBe('release');
      expect(movement.qty).toBe(30);
    });

    it('throws if released quantity exceeds reserved stock', () => {
      const initial = { productId: 'p1', onHand: 100, reserved: 20 };
      expect(() => applyRelease(initial, 25)).toThrow(/Cannot release 25/);
    });
  });

  describe('applyAdjust', () => {
    it('applies positive adjustment (restock)', () => {
      const initial = { productId: 'p1', onHand: 50, reserved: 10 };
      const { stockLevel, movement } = applyAdjust(initial, 20, { reason: 'Physical cycle recount' });

      expect(stockLevel.onHand).toBe(70);
      expect(movement.type).toBe('in');
      expect(movement.qty).toBe(20);
    });

    it('applies negative adjustment (shrinkage)', () => {
      const initial = { productId: 'p1', onHand: 50, reserved: 10 };
      const { stockLevel, movement } = applyAdjust(initial, -15, { reason: 'Transit breakage' });

      expect(stockLevel.onHand).toBe(35);
      expect(movement.type).toBe('out');
      expect(movement.qty).toBe(15);
    });

    it('requires a non-empty reason for adjustments', () => {
      const initial = { productId: 'p1', onHand: 50, reserved: 10 };
      expect(() => applyAdjust(initial, 10, { reason: '' })).toThrow(/Reason is required/);
      expect(() => applyAdjust(initial, 10, { reason: '   ' })).toThrow(/Reason is required/);
    });

    it('blocks adjustment if onHand would drop below reserved count', () => {
      const initial = { productId: 'p1', onHand: 50, reserved: 40 };
      expect(() => applyAdjust(initial, -20, { reason: 'Scrap defective units' })).toThrow(
        /less than reserved/
      );
    });
  });

  describe('applyOpeningStock', () => {
    it('sets initial onHand and logs in movement', () => {
      const initial = { productId: 'p1', onHand: 0, reserved: 0 };
      const { stockLevel, movement } = applyOpeningStock(initial, 150, 'seller');

      expect(stockLevel.onHand).toBe(150);
      expect(movement.type).toBe('in');
      expect(movement.qty).toBe(150);
      expect(movement.reason).toBe('Opening stock');
    });

    it('throws if opening stock is negative', () => {
      const initial = { productId: 'p1', onHand: 0, reserved: 0 };
      expect(() => applyOpeningStock(initial, -10)).toThrow(/cannot be negative/);
    });
  });
});

