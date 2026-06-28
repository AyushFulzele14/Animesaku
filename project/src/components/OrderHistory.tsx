import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, AlertCircle, Clock, CheckCircle, Truck, Box } from 'lucide-react';
import { useAuth } from '../hooks';
import { api, API_BASE_URL } from '../lib/api';
import { formatINR } from '../utils/currency';

interface OrderItem {
  product: { id: string; title: string; image: string; price: number };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentInfo: {
    method: 'COD' | 'Razorpay';
    status: string;
  };
  totals: {
    subtotal: number;
    shipping: number;
    couponDiscount: number;
    grandTotal: number;
  };
  orderStatus: 'Processing' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface OrderHistoryProps {
  onClose: () => void;
}

const statusConfig = {
  Processing: { color: 'bg-yellow-500/20', border: 'border-yellow-500', icon: Clock, label: 'Processing' },
  Confirmed: { color: 'bg-blue-500/20', border: 'border-blue-500', icon: CheckCircle, label: 'Confirmed' },
  Shipped: { color: 'bg-purple-500/20', border: 'border-purple-500', icon: Truck, label: 'Shipped' },
  Delivered: { color: 'bg-green-500/20', border: 'border-green-500', icon: CheckCircle, label: 'Delivered' },
  Cancelled: { color: 'bg-red-500/20', border: 'border-red-500', icon: AlertCircle, label: 'Cancelled' },
};

export function OrderHistory({ onClose }: OrderHistoryProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<Order[]>('/orders/my-orders');
        setOrders(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const downloadInvoice = async (orderId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = new Headers();
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/invoice`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch invoice: ${response.statusText}`);
      }

      const blob = await response.blob();
      const htmlUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = htmlUrl;
      link.download = `invoice-${orderId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(htmlUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to download invoice');
    }
  };

  if (selectedOrder) {
    const config = statusConfig[selectedOrder.orderStatus];
    const StatusIcon = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      >
        <motion.div
          className="bg-matte-black border border-primary-red/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <div className="sticky top-0 bg-matte-black border-b border-primary-red/20 p-6 flex items-center justify-between">
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex items-center gap-2 text-silver-white hover:text-primary-red transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Orders
            </button>
            <h2 className="text-xl font-bold text-silver-white">Order Details</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Header */}
            <div className="border border-primary-red/20 rounded-2xl p-4 bg-black/70">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-silver-white/60 text-sm">Order ID</p>
                  <p className="text-silver-white font-mono text-lg">{selectedOrder._id}</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${config.border} ${config.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-silver-white font-semibold">{config.label}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-silver-white/60">Order Date</p>
                  <p className="text-silver-white">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-silver-white/60">Payment Method</p>
                  <p className="text-silver-white">{selectedOrder.paymentInfo.method}</p>
                </div>
                {selectedOrder.trackingNumber && (
                  <div>
                    <p className="text-silver-white/60">Tracking Number</p>
                    <p className="text-silver-white font-mono">{selectedOrder.trackingNumber}</p>
                  </div>
                )}
                {selectedOrder.estimatedDelivery && (
                  <div>
                    <p className="text-silver-white/60">Est. Delivery</p>
                    <p className="text-silver-white">{new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="border border-primary-red/20 rounded-2xl p-4 bg-black/70">
              <h3 className="text-lg font-semibold text-silver-white mb-4">Items</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-matte-black rounded-lg border border-primary-red/10">
                    <div>
                      <p className="text-silver-white font-medium">{item.product.title}</p>
                      <p className="text-silver-white/60 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-primary-red font-bold">{formatINR(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border border-primary-red/20 rounded-2xl p-4 bg-black/70">
              <h3 className="text-lg font-semibold text-silver-white mb-4">Shipping Address</h3>
              <p className="text-silver-white">{selectedOrder.shippingAddress.street}</p>
              <p className="text-silver-white">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
              <p className="text-silver-white">{selectedOrder.shippingAddress.country}</p>
            </div>

            {/* Totals */}
            <div className="border border-primary-red/20 rounded-2xl p-4 bg-black/70 space-y-2">
              <div className="flex justify-between text-silver-white/80">
                <span>Subtotal</span>
                <span>{formatINR(selectedOrder.totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-silver-white/80">
                <span>Shipping</span>
                <span>{formatINR(selectedOrder.totals.shipping)}</span>
              </div>
              {selectedOrder.totals.couponDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-{formatINR(selectedOrder.totals.couponDiscount)}</span>
                </div>
              )}
              <div className="border-t border-primary-red/20 pt-2 flex justify-between text-primary-red font-bold text-lg">
                <span>Total</span>
                <span>{formatINR(selectedOrder.totals.grandTotal)}</span>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => downloadInvoice(selectedOrder._id)}
              className="w-full flex items-center justify-center gap-2 bg-primary-red text-black py-3 rounded-2xl font-semibold hover:bg-red-600 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Invoice
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
    >
      <motion.div
        className="bg-matte-black border border-primary-red/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <div className="sticky top-0 bg-matte-black border-b border-primary-red/20 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-silver-white">Your Orders</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-primary-red/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-silver-white" />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <Box className="w-8 h-8 text-primary-red" />
              </div>
              <p className="text-silver-white/60 mt-4">Loading your orders...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-12">
              <Box className="w-12 h-12 text-silver-white/40 mx-auto mb-4" />
              <p className="text-silver-white/60">You haven't placed any orders yet.</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-primary-red text-black rounded-full font-semibold hover:bg-red-600 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="space-y-3">
              {orders.map((order) => {
                const config = statusConfig[order.orderStatus];
                const StatusIcon = config.icon;

                return (
                  <motion.button
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    whileHover={{ scale: 1.02 }}
                    className="w-full text-left border border-primary-red/20 rounded-2xl p-4 bg-black/70 hover:bg-black/90 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-silver-white font-semibold">Order #{order._id.slice(-8)}</p>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${config.border} ${config.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span className="text-silver-white">{config.label}</span>
                          </div>
                        </div>
                        <p className="text-silver-white/60 text-sm">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary-red font-bold">{formatINR(order.totals.grandTotal)}</p>
                        <p className="text-silver-white/60 text-sm">{order.paymentInfo.method}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
