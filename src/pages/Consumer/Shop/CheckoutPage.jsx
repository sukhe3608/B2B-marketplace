/* ============================================================
   TradeLink — CheckoutPage (/consumer/checkout)
   Wholesale order checkout: delivery address, shipping mode,
   per-supplier order generation, stock re-check, and COD / Net-30 credit.
   ============================================================ */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft, Truck, ShieldCheck, CreditCard, Building,
  AlertCircle, CheckCircle2, Lock
} from 'lucide-react';
import DashboardShell from '../../../components/layout/DashboardShell';
import { selectCartLines, clearCart } from '../../../store/cartSlice';
import { groupCartBySeller, cartTotals } from '../../../logic/cartLogic';
import { shopService } from '../../../services/shopService';
import { useAuth } from '../../../hooks';
import './shop-pages.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const consumerId = (user?.email === 'consumer@demo.com' || !user?.id) ? 'consumer-demo' : user.id;

  const lines = useSelector(selectCartLines);
  const sellerGroups = groupCartBySeller(lines);
  const totals = cartTotals(lines);

  // Form State
  const [address, setAddress] = useState({
    name: user?.name || 'Procurement Officer',
    street: 'Plot 42, MIDC Industrial Area, Phase II',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411026',
    phone: user?.contact || '+91 98765 43210',
  });

  const [deliveryOption, setDeliveryOption] = useState('road_transport'); // 'road_transport' | 'express_cargo'
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'net_30'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (lines.length === 0) {
    return (
      <DashboardShell role="consumer">
        <div className="shop-page-container text-center p-12">
          <h2 className="font-bold text-lg mb-2">No Items to Checkout</h2>
          <p className="text-muted text-sm mb-4">Your wholesale cart is empty.</p>
          <Link to="/consumer/shop" className="btn btn-primary btn-sm">
            Return to Shop
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const handleAddressChange = (field, val) => {
    setAddress((prev) => ({ ...prev, [field]: val }));
  };

  const handlePlaceOrders = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!address.name || !address.street || !address.city || !address.pincode) {
      setErrorMessage('Please complete all required shipping address fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Place order via service
      // Note: If multiple sellers, creates separate orders per seller group
      for (const group of sellerGroups) {
        await shopService.placeOrder(consumerId, {
          sellerId: group.sellerId,
          lines: group.lines,
          address,
          deliveryOption,
          paymentMethod,
        });
      }

      dispatch(clearCart());
      setIsSubmitting(false);
      navigate('/consumer/orders');
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to place wholesale order. Please check stock availability.');
    }
  };

  return (
    <DashboardShell role="consumer">
      <div className="shop-page-container animate-fade-in-up">
        <div className="mb-4">
          <Link to="/consumer/cart" className="text-sm text-muted inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft size={14} />
            <span>Back to Cart</span>
          </Link>
        </div>

        <div className="inv-page-header">
          <div className="inv-header-title">
            <h1>Wholesale Purchase Order Checkout</h1>
            <p>Review shipping coordinates, commercial freight mode, and payment terms.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="form-error-banner mb-6" role="alert">
            <AlertCircle size={18} className="flex-shrink-0" />
            <div>
              <strong className="block">Order Placement Blocked</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handlePlaceOrders} className="checkout-layout">
          {/* Left Form: Address, Delivery & Payment */}
          <div>
            {/* Shipping Address Card */}
            <div className="checkout-card">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <Truck size={18} className="text-primary" />
                <span>Commercial Delivery Destination</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group sm:col-span-2">
                  <label className="form-label" htmlFor="company-name">Company / Consignee Name *</label>
                  <input
                    id="company-name"
                    type="text"
                    required
                    className="form-input"
                    value={address.name}
                    onChange={(e) => handleAddressChange('name', e.target.value)}
                  />
                </div>

                <div className="form-group sm:col-span-2">
                  <label className="form-label" htmlFor="street-addr">Warehouse / Facility Street Address *</label>
                  <input
                    id="street-addr"
                    type="text"
                    required
                    className="form-input"
                    value={address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="addr-city">City *</label>
                  <input
                    id="addr-city"
                    type="text"
                    required
                    className="form-input"
                    value={address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="addr-state">State *</label>
                  <input
                    id="addr-state"
                    type="text"
                    required
                    className="form-input"
                    value={address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="addr-pincode">Postal Pincode *</label>
                  <input
                    id="addr-pincode"
                    type="text"
                    required
                    className="form-input"
                    value={address.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="addr-phone">Receiver Phone Number *</label>
                  <input
                    id="addr-phone"
                    type="text"
                    required
                    className="form-input"
                    value={address.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Commercial Freight Option */}
            <div className="checkout-card">
              <h3 className="font-bold text-base mb-4">Logistics Freight Preference</h3>
              <div className="space-y-3">
                <label className={`payment-option-label ${deliveryOption === 'road_transport' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="freight"
                    value="road_transport"
                    checked={deliveryOption === 'road_transport'}
                    onChange={() => setDeliveryOption('road_transport')}
                  />
                  <div>
                    <span className="font-semibold block text-sm">Standard Commercial Road Transport</span>
                    <span className="text-xs text-muted">Economical multi-axle freight (3–5 business days)</span>
                  </div>
                </label>

                <label className={`payment-option-label ${deliveryOption === 'express_cargo' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="freight"
                    value="express_cargo"
                    checked={deliveryOption === 'express_cargo'}
                    onChange={() => setDeliveryOption('express_cargo')}
                  />
                  <div>
                    <span className="font-semibold block text-sm">Priority Express Air Cargo</span>
                    <span className="text-xs text-muted">Dedicated cargo flight dispatch (24–48 hours)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* B2B Commercial Settlement Mode */}
            <div className="checkout-card">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-primary" />
                <span>Commercial Settlement Mode</span>
              </h3>

              <div className="space-y-3">
                <label className={`payment-option-label ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div>
                    <span className="font-semibold block text-sm">Cash on Delivery / RTGS on Inspection</span>
                    <span className="text-xs text-muted">Pay supplier upon freight delivery inspection</span>
                  </div>
                </label>

                <label className={`payment-option-label ${paymentMethod === 'net_30' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="net_30"
                    checked={paymentMethod === 'net_30'}
                    onChange={() => setPaymentMethod('net_30')}
                  />
                  <div>
                    <span className="font-semibold block text-sm">TradeLink Net-30 Working Capital Credit</span>
                    <span className="text-xs text-muted">Approved enterprise net credit with 30-day payment term</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <aside>
            <div className="cart-summary-card">
              <h3 className="font-bold text-base mb-4 pb-2 border-b">Order Fulfillment Breakdown</h3>

              <div className="space-y-3 mb-6">
                {sellerGroups.map((group) => (
                  <div key={group.sellerId} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="font-bold text-slate-800 mb-1">{group.sellerName}</div>
                    <ul className="space-y-1 mb-2 text-muted">
                      {group.lines.map((l) => (
                        <li key={l.productId} className="flex justify-between">
                          <span className="truncate max-w-[170px]">{l.title} (x{l.qty})</span>
                          <span className="font-mono">₹{Number(l.total).toLocaleString('en-IN')}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Order Subtotal:</span>
                      <span>₹{Number(group.totals.total).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <div className="flex justify-between">
                  <span>Gross Product Subtotal:</span>
                  <span>₹{Number(totals.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Combined GST:</span>
                  <span>₹{Number(totals.gstAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold py-3 border-t border-b border-slate-200 mb-6">
                <span>Total Payable:</span>
                <span className="text-primary font-bold">
                  ₹{Number(totals.grandTotal).toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full py-3"
                disabled={isSubmitting}
              >
                <Lock size={15} />
                <span>{isSubmitting ? 'Reserving Stock...' : 'Place Wholesale Order'}</span>
              </button>

              <div className="mt-4 pt-4 border-t text-xs text-muted space-y-1">
                <p>✔ Real-time stock reserve lock upon submission</p>
                <p>✔ Buyer cancellation allowed while status is Placed</p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </DashboardShell>
  );
}

