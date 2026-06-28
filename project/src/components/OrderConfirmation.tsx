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

  useEffect(() => {
    setShowAnimation(true);
  }, []);

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
