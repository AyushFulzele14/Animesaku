import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Home, ShoppingBag, Clock } from 'lucide-react';

export interface ConfirmationProps {
  orderId: string;
  orderData?: {
    items: Array<{ product: { title: string }; quantity: number }>;
    totals: { grandTotal: number };
    paymentInfo: { method: string };
  };
  onDone?: () => void;
}

export function OrderConfirmation({ orderId, orderData, onDone }: ConfirmationProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyUpi = () => {
    const upi = import.meta.env.VITE_UPI_ID || 'gmbaldurgaming@okicici';
    void navigator.clipboard.writeText(upi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setShowAnimation(true);
  }, []);

  const upiId = import.meta.env.VITE_UPI_ID || 'gmbaldurgaming@okicici';
  const whatsappNum = import.meta.env.VITE_WHATSAPP_NUMBER || '919359320860';
  const amount = orderData?.totals.grandTotal || 0;
  
  const whatsappText = `Hi! I have placed an order on AnimySaku Store. Here are my payment details:\n\nOrder ID: ${orderId}\nAmount: ₹${amount.toFixed(2)}`;
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="bg-matte-black border border-primary-red/30 rounded-3xl max-w-md w-full overflow-hidden"
      >
        {/* Animated Success Icon */}
        <div className="p-8 text-center bg-black/50">
          <motion.div
            initial={{ scale: 0 }}
            animate={showAnimation ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          >
            <CheckCircle className="w-16 h-16 text-primary-red mx-auto" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={showAnimation ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-silver-white mt-4"
          >
            Order Confirmed!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={showAnimation ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="text-silver-white/60 mt-2"
          >
            Thank you for your order
          </motion.p>
        </div>

        {/* Order Details */}
        <div className="p-6 space-y-4 bg-black">
          {/* Order ID */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={showAnimation ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.7 }}
            className="border border-primary-red/20 rounded-2xl p-4 bg-black/70"
          >
            <p className="text-silver-white/60 text-sm">Order ID</p>
            <p className="text-silver-white font-mono font-bold text-lg break-all">{orderId}</p>
          </motion.div>

          {/* Order Summary */}
          {orderData && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={showAnimation ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="border border-primary-red/20 rounded-2xl p-4 bg-black/70 space-y-2"
            >
              <div className="flex justify-between items-center">
                <p className="text-silver-white/60">Items</p>
                <p className="text-silver-white font-semibold">{orderData.items.length}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-silver-white/60">Payment Method</p>
                <p className="text-silver-white font-semibold">{orderData.paymentInfo.method}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-silver-white/60">Total Amount</p>
                <p className="text-primary-red font-bold text-lg">₹{orderData.totals.grandTotal.toFixed(2)}</p>
              </div>
            </motion.div>
          )}

          {orderData?.paymentInfo.method === 'UPI' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={showAnimation ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.85 }}
              className="border border-primary-red/30 rounded-2xl p-4 bg-black/80 flex flex-col items-center text-center space-y-3"
            >
              <h3 className="text-primary-red font-bold text-base">Scan & Prepay via UPI</h3>
              <p className="text-xs text-silver-white/70">
                Scan this dynamic QR code using GPay, PhonePe, Paytm, or BHIM to pay <strong>₹{amount.toFixed(2)}</strong>.
              </p>
              
              <div className="bg-white p-2 rounded-2xl border border-primary-red/20 shadow-neon-red">
                <img
                  src="/qr-code.jpg"
                  alt="UPI QR Code"
                  className="w-44 h-44 object-contain"
                />
              </div>

              <div className="flex items-center gap-2 bg-matte-black px-3 py-2 rounded-xl border border-primary-red/10 w-full justify-between">
                <span className="text-xs text-silver-white/60 font-mono select-all truncate flex-1 text-left">{upiId}</span>
                <button
                  onClick={handleCopyUpi}
                  className="text-xs font-bold uppercase tracking-wider bg-primary-red/10 text-primary-red border border-primary-red/30 px-3 py-1 rounded-lg hover:bg-primary-red hover:text-black transition-all"
                >
                  {copied ? 'Copied' : 'Copy ID'}
                </button>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.208-3.816l.41.243c1.558.924 3.42 1.412 5.334 1.413 5.485 0 9.948-4.463 9.952-9.953.002-2.66-1.033-5.161-2.913-7.043C17.168 3.02 14.67 1.986 12.01 1.986c-5.49 0-9.955 4.463-9.96 9.953-.002 1.83.479 3.619 1.393 5.198l.255.441L2.704 21.03l3.561-1.306zm13.149-10.222c-.3-.15-1.77-.874-2.046-.975-.276-.102-.477-.152-.676.15-.199.3-.772.976-.947 1.176-.174.201-.35.226-.65.076-.3-.15-1.267-.467-2.414-1.49-1.066-.951-1.802-2.124-2.011-2.424-.21-.3-.022-.462.128-.611.135-.135.3-.349.45-.524.15-.175.2-.299.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.629-.926-2.229-.244-.587-.492-.507-.676-.516-.175-.008-.375-.01-.576-.01-.2 0-.526.075-.801.375-.276.3-1.053 1.026-1.053 2.502 0 1.477 1.077 2.9 1.226 3.1.15.2 2.119 3.235 5.132 4.536.716.31 1.275.495 1.71.634.72.228 1.375.196 1.893.118.577-.087 1.77-.724 2.02-1.388.251-.664.251-1.233.175-1.353-.075-.12-.275-.195-.575-.345z" />
                </svg>
                Share Receipt on WhatsApp
              </a>
            </motion.div>
          )}

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={showAnimation ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.9 }}
            className="border border-primary-red/20 rounded-2xl p-4 bg-black/70"
          >
            <h3 className="text-silver-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-red" />
              What Happens Next?
            </h3>
            <ul className="space-y-2 text-sm text-silver-white/80">
              <li className="flex gap-2">
                <span className="text-primary-red">•</span>
                <span>You'll receive a confirmation email shortly</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-red">•</span>
                <span>Your order will be prepared and shipped</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-red">•</span>
                <span>Tracking number will be sent when shipped</span>
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showAnimation ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1 }}
            className="grid grid-cols-2 gap-3"
          >
            <button
              onClick={onDone}
              className="flex items-center justify-center gap-2 bg-primary-red text-black py-3 rounded-2xl font-semibold hover:bg-red-600 transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={onDone}
              className="flex items-center justify-center gap-2 bg-black border border-primary-red/30 text-silver-white py-3 rounded-2xl font-semibold hover:border-primary-red transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop
            </button>
          </motion.div>

          {/* View Order Link */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={showAnimation ? { opacity: 1 } : {}}
            transition={{ delay: 1.1 }}
            onClick={onDone}
            className="w-full text-center text-primary-red hover:text-red-600 text-sm font-semibold transition-colors"
          >
            View Your Orders →
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
