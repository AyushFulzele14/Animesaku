import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useAuth, useCart } from '../hooks';
import { api } from '../lib/api';
import { formatINR } from '../utils/currency';
import { OrderConfirmation, ConfirmationProps } from './OrderConfirmation';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type RazorpayPayload = {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
  isMock: boolean;
};

export function CartDrawer() {
  const { cart, total, isCartOpen, closeCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateValue, setStateValue] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Razorpay'>('COD');
  const [paymentPayload, setPaymentPayload] = useState<RazorpayPayload | null>(null);
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

  const loadRazorpayScript = async (): Promise<boolean> => {
    if (window.Razorpay) {
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const verifyRazorpayPayment = async (
    payload: {
      orderId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    },
    orderData?: ConfirmationProps['orderData']
  ) => {
    await api.post('/orders/verify-payment', payload);
    clearCart();
    setCheckoutMessage('Payment verified and order confirmed successfully!');
    setOrderConfirmed({
      orderId: payload.orderId,
      data: orderData || {
        items: [],
        totals: { grandTotal: 0 },
        paymentInfo: { method: 'Razorpay' }
      }
    });
  };

  const openRazorpayCheckout = async (payload: RazorpayPayload, orderData: ConfirmationProps['orderData']) => {
    if (payload.isMock) {
      await verifyRazorpayPayment({
        orderId: payload.orderId,
        razorpayOrderId: payload.razorpayOrderId,
        razorpayPaymentId: 'mock_payment_id',
        razorpaySignature: 'mock_signature',
      }, orderData);
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      throw new Error('Unable to load Razorpay checkout. Please try again.');
    }

    const checkoutOptions = {
      key: payload.key,
      amount: payload.amount,
      currency: payload.currency,
      name: 'Animysaku Store',
      description: 'Anime merchandise order',
      order_id: payload.razorpayOrderId,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: phoneNumber,
      },
      notes: {
        orderId: payload.orderId,
      },
      theme: {
        color: '#ee1010',
      },
      handler: async (razorpayResponse: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        setCheckoutLoading(true);
        try {
          await verifyRazorpayPayment({
            orderId: payload.orderId,
            razorpayOrderId: razorpayResponse.razorpay_order_id,
            razorpayPaymentId: razorpayResponse.razorpay_payment_id,
            razorpaySignature: razorpayResponse.razorpay_signature,
          }, orderData);
        } catch (error) {
          setCheckoutMessage(error instanceof Error ? error.message : 'Payment verification failed.');
        } finally {
          setCheckoutLoading(false);
        }
      },
      modal: {
        ondismiss: () => {
          setCheckoutMessage('Razorpay checkout closed. You can retry payment.');
        },
      },
    };

    const razorpay = new window.Razorpay(checkoutOptions);
    razorpay.open();
  };

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
    setPaymentPayload(null);

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

      if (paymentMethod === 'COD') {
        clearCart();
        setCheckoutMessage('Order placed successfully! Thank you for shopping with us.');
        setOrderConfirmed({
          orderId: response.orderId || response._id || '',
          data: response as ConfirmationProps['orderData'],
        });
      } else if (paymentMethod === 'Razorpay') {
        const payload: RazorpayPayload = {
          orderId: response.orderId || response._id || '',
          razorpayOrderId: response.razorpayOrderId || '',
          amount: response.amount || 0,
          currency: response.currency || 'INR',
          key: response.key || '',
          isMock: !!response.isMock,
        };
        setPaymentPayload(payload);
        setCheckoutMessage('Razorpay transaction initialized — opening checkout.');
        await openRazorpayCheckout(payload, response as ConfirmationProps['orderData']);
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
              <div key={item.product.id} className="grid grid-cols-[auto_1fr] gap-4 rounded-3xl border border-primary-red/20 p-4 bg-black/70">
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  className="h-24 w-24 rounded-3xl object-cover cursor-zoom-in hover:opacity-85 transition-opacity"
                  onClick={() => {
                    closeCart();
                    window.dispatchEvent(new CustomEvent('open-image-lightbox', { detail: { imageUrl: item.product.image } }));
                  }}
                />
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-silver-white">{item.product.title}</h3>
                    <p className="text-silver-white/60 text-sm">{item.product.animeName}</p>
                    <p className="text-primary-red font-bold mt-2">{formatINR(item.product.discountPrice || item.product.price)}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-4">
                    <div className="flex items-center rounded-full bg-matte-black/80 border border-primary-red/30 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="px-3 py-2 hover:bg-primary-red/10"
                      >
                        <Minus className="w-4 h-4 text-silver-white" />
                      </button>
                      <span className="px-4 text-silver-white">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-3 py-2 hover:bg-primary-red/10"
                      >
                        <Plus className="w-4 h-4 text-silver-white" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
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
                {(['COD', 'Razorpay'] as const).map((method) => (
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
                      <div className="font-semibold text-silver-white">{method === 'COD' ? 'Cash on Delivery' : 'Razorpay'}</div>
                      <div className="text-silver-white/60 text-sm">
                        {method === 'COD'
                          ? 'Pay when your order arrives.'
                          : 'Prepay securely using Razorpay.'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {paymentMethod === 'Razorpay' && (
                <p className="mt-3 text-sm text-silver-white/70">
                  After you submit, the backend will initialize a Razorpay transaction order. You must complete payment to finalize the order.
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

            {paymentPayload && (
              <div className="rounded-3xl border border-primary-red/20 bg-black/70 p-4">
                <h4 className="font-semibold text-silver-white mb-2">Razorpay transaction details</h4>
                <div className="text-sm text-silver-white/70 space-y-1">
                  <p>Order ID: {paymentPayload.orderId}</p>
                  <p>Razorpay Order ID: {paymentPayload.razorpayOrderId}</p>
                  <p>Amount: {formatINR(paymentPayload.amount / 100)}</p>
                  <p>Currency: {paymentPayload.currency}</p>
                  <p>Mode: {paymentPayload.isMock ? 'Mock / fallback' : 'Live'}</p>
                </div>
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
                {checkoutLoading ? 'Processing...' : `Checkout (${paymentMethod === 'COD' ? 'Cash on Delivery' : 'Razorpay'})`}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
    </>
  );
}
