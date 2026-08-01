import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useAuth, useCart } from '../hooks';
import { api, resolveAssetUrl } from '../lib/api';
import { formatINR } from '../utils/currency';
import { OrderConfirmation, ConfirmationProps } from './OrderConfirmation';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}



export function CartDrawer() {
  const { cart, total, isCartOpen, closeCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateValue, setStateValue] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState<{ orderId: string; data: ConfirmationProps['orderData'] } | null>(null);

  // Coupon discount states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!user) {
      setCouponError('Please log in to apply coupon codes.');
      return;
    }
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await api.post<{
        code: string;
        discountType: 'percentage' | 'fixed';
        discountValue: number;
        discountAmount: number;
      }>('/coupons/validate', {
        code: couponCode.trim().toUpperCase(),
        cartAmount: total,
      });
      setAppliedCoupon(result);
      setCouponError(null);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Invalid or expired coupon.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const shippingCharge = total > 0 && total < 500 ? 40 : 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = total + shippingCharge - discountAmount;



  const handleCheckout = async () => {
    if (!user) {
      setCheckoutMessage('Please log in before checking out.');
      return;
    }

    if (!street || !city || !stateValue || !zipCode || !phoneNumber) {
      setCheckoutMessage('Please provide a complete shipping address before checkout.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutMessage(null);

    try {
      interface CheckoutResponse {
        orderId?: string;
        _id?: string;
        items?: Array<{ product: { title: string }; quantity: number }>;
        totals?: { grandTotal: number };
        paymentInfo?: { method: string };
        razorpayOrderId?: string;
        amount?: number;
        currency?: string;
        key?: string;
        isMock?: boolean;
      }

      const response = await api.post<CheckoutResponse>('/orders/create', {
        shippingAddress: {
          street,
          city,
          state: stateValue,
          zipCode,
          country,
          phoneNumber,
        },
        paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
      });

      if (paymentMethod === 'COD' || paymentMethod === 'UPI') {
        clearCart();
        setCheckoutMessage(paymentMethod === 'COD' 
          ? 'Order placed successfully! Thank you for shopping with us.' 
          : 'Order placed successfully! Please complete your UPI payment.'
        );
        if (paymentMethod === 'UPI') {
          alert('Order Placed Successfully!\n\nPlease complete your UPI payment on the next screen.');
        }
        closeCart();
        setOrderConfirmed({
          orderId: response.orderId || response._id || '',
          data: response as ConfirmationProps['orderData'],
        });
      }
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : 'Failed to place order.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      {orderConfirmed && (
        <OrderConfirmation 
          orderId={orderConfirmed.orderId} 
          orderData={orderConfirmed.data}
          onDone={() => {
            setOrderConfirmed(null);
            setCheckoutMessage(null);
            setCheckoutLoading(false);
            closeCart();
          }}
        />
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isCartOpen ? 1 : 0 }}
        className={`fixed inset-0 z-50 pointer-events-none ${isCartOpen ? 'pointer-events-auto' : ''}`}
      >
      <div
        className="absolute inset-0 bg-black/70"
        onClick={closeCart}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isCartOpen ? 0 : '100%' }}
        transition={{ type: 'tween', duration: 0.25 }}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-matte-black border-l border-primary-red/30 shadow-2xl overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-primary-red/20">
          <div>
            <h2 className="text-2xl font-bold text-silver-white">Your Cart</h2>
            <p className="text-silver-white/60 text-sm">{cart.length} item{cart.length === 1 ? '' : 's'}</p>
          </div>
          <button onClick={closeCart} className="p-2 rounded-lg hover:bg-primary-red/20 transition-colors duration-200">
            <X className="w-5 h-5 text-silver-white" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-silver-white/70">
              Your cart is empty. Add something special from the Shop.
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.product.id}-${item.size || 'A4'}-${item.finishType || 'matte'}`} className="grid grid-cols-[auto_1fr] gap-4 rounded-3xl border border-primary-red/20 p-4 bg-black/70">
                <img
                  src={resolveAssetUrl(item.product.image)}
                  alt={item.product.title}
                  className="h-24 w-24 rounded-3xl object-cover cursor-zoom-in hover:opacity-85 transition-opacity"
                  onClick={() => {
                    closeCart();
                    window.dispatchEvent(new CustomEvent('open-image-lightbox', { detail: { imageUrl: resolveAssetUrl(item.product.image) } }));
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.pexels.com/photos/3587620/pexels-photo-3587620.jpeg?w=400&h=400&fit=crop";
                  }}
                />
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-silver-white">{item.product.title}</h3>
                    <p className="text-silver-white/60 text-sm">
                      {item.product.animeName}
                      <span className="text-xs text-silver-white/40 block mt-0.5">
                        Size: {item.size || 'A4'} | Finish: {item.finishType || 'matte'}
                      </span>
                    </p>
                    <p className="text-primary-red font-bold mt-2">{formatINR(item.product.discountPrice || item.product.price)}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-4">
                    <div className="flex items-center rounded-full bg-matte-black/80 border border-primary-red/30 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.finishType, item.size)}
                        className="px-3 py-2 hover:bg-primary-red/10"
                      >
                        <Minus className="w-4 h-4 text-silver-white" />
                      </button>
                      <span className="px-4 text-silver-white">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.finishType, item.size)}
                        className="px-3 py-2 hover:bg-primary-red/10"
                      >
                        <Plus className="w-4 h-4 text-silver-white" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id, item.finishType, item.size)}
                      className="p-2 rounded-full hover:bg-primary-red/20"
                    >
                      <Trash2 className="w-5 h-5 text-silver-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4 p-6">
          <form className="space-y-4" onSubmit={(event) => {
            event.preventDefault();
            handleCheckout();
          }}>
            <div className="rounded-3xl border border-primary-red/20 bg-black/70 p-4">
              <h3 className="text-lg font-semibold text-silver-white mb-3">Shipping information</h3>
              <div className="grid gap-3">
                <input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street address"
                  className="input"
                />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="input"
                />
                <input
                  value={stateValue}
                  onChange={(e) => setStateValue(e.target.value)}
                  placeholder="State"
                  className="input"
                />
                <input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="ZIP / Postal Code"
                  className="input"
                />
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                  className="input"
                />
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone number"
                  className="input"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-primary-red/20 bg-black/70 p-4">
              <h3 className="text-lg font-semibold text-silver-white mb-3">Payment method</h3>
              <div className="space-y-2">
               {(['COD', 'UPI'] as const).map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 rounded-2xl border border-primary-red/20 px-4 py-3 cursor-pointer transition-colors duration-200 hover:border-primary-red"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="accent-primary-red"
                    />
                    <div>
                      <div className="font-semibold text-silver-white">{method === 'COD' ? 'Cash on Delivery' : 'UPI / QR Code'}</div>
                      <div className="text-silver-white/60 text-sm">
                        {method === 'COD'
                          ? 'Pay when your order arrives.'
                          : 'Prepay using UPI ID / QR code.'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {paymentMethod === 'UPI' && (
                <p className="mt-3 text-sm text-silver-white/70">
                  After you submit, you will be shown our UPI QR code and payment details to complete your order.
                </p>
              )}
            </div>

            {/* Apply Coupon Section */}
            {cart.length > 0 && (
              <div className="rounded-3xl border border-primary-red/20 bg-black/70 p-4">
                <h3 className="text-lg font-semibold text-silver-white mb-3">Apply Coupon</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="COUPON CODE"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="input uppercase"
                    disabled={couponLoading || !!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode('');
                      }}
                      className="px-4 py-2 border border-primary-red/50 text-primary-red font-bold rounded-lg hover:bg-primary-red/10 transition-all text-xs"
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 bg-primary-red text-black font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all text-xs"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && <p className="text-xs text-primary-red mt-2">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-xs text-green-500 mt-2 font-medium">
                    Coupon '{appliedCoupon.code}' applied successfully!
                  </p>
                )}
              </div>
            )}

            {checkoutMessage && (
              <div className="rounded-3xl bg-primary-red/10 border border-primary-red/30 p-4 text-silver-white">
                {checkoutMessage}
              </div>
            )}



            <div className="rounded-3xl border border-primary-red/20 bg-black/70 p-4 space-y-3">
              <div className="flex items-center justify-between text-silver-white/80 text-sm">
                <span>Subtotal</span>
                <span className="font-semibold text-silver-white">{formatINR(total)}</span>
              </div>
              <div className="flex items-center justify-between text-silver-white/80 text-sm">
                <span>Shipping Fee</span>
                <span className="font-semibold text-silver-white">
                  {shippingCharge === 0 ? 'FREE' : formatINR(shippingCharge)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-green-500 text-sm font-medium">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-primary-red/20 pt-2 flex items-center justify-between text-silver-white font-bold text-lg">
                <span>Grand Total</span>
                <span className="text-primary-red text-shadow-glow">{formatINR(grandTotal)}</span>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-red text-black py-3 rounded-3xl font-semibold hover:bg-red-600 transition-colors duration-200 disabled:opacity-60"
                disabled={cart.length === 0 || checkoutLoading}
              >
                 {checkoutLoading ? 'Processing...' : `Checkout (${paymentMethod === 'COD' ? 'Cash on Delivery' : 'UPI / QR Code'})`}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
    </>
  );
}
