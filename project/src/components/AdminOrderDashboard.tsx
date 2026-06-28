import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks';
import { api } from '../lib/api';
import { formatINR } from '../utils/currency';

interface OrderItem {
  product: { id: string; title: string } | null;
  quantity: number;
  price: number;
}

interface AdminOrder {
  _id: string;
  user: { name: string; email: string } | null;
  items: OrderItem[];
  orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
  paymentInfo: { method: string; status: string };
  totals: { grandTotal: number };
  shippingAddress: { street: string; city: string };
  createdAt: string;
  trackingNumber?: string;
  returnRequest?: {
    reason: string;
    status: 'None' | 'Requested' | 'Approved' | 'Rejected';
    requestedAt?: string;
    actionedAt?: string;
  };
}

const statusOptions = ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

const statusColors: Record<string, string> = {
  Processing: 'bg-yellow-500/20 border-yellow-500',
  Shipped: 'bg-purple-500/20 border-purple-500',
  Delivered: 'bg-green-500/20 border-green-500',
  Cancelled: 'bg-red-500/20 border-red-500',
  Returned: 'bg-blue-500/20 border-blue-500',
};

export function AdminOrderDashboard() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = filterStatus === 'All' 
        ? '/orders/admin/all-orders'
        : `/orders/admin/all-orders?status=${filterStatus}`;
      const data = await api.get<AdminOrder[]>(endpoint);
      setOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders();
  }, [isAdmin, fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      await api.patch(`/orders/admin/${orderId}/update-status`, { status: newStatus });
      setOrders(orders.map(o => 
        o._id === orderId ? { ...o, orderStatus: newStatus as AdminOrder['orderStatus'] } : o
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const updateTrackingNumber = async (orderId: string, trackingNumber: string) => {
    setUpdatingOrder(orderId);
    try {
      await api.patch(`/orders/admin/${orderId}/add-tracking`, { trackingNumber });
      setOrders(orders.map(o =>
        o._id === orderId ? { ...o, trackingNumber } : o
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update tracking');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleReturnAction = async (orderId: string, action: 'Approved' | 'Rejected') => {
    setUpdatingOrder(orderId);
    try {
      const response = await api.patch<AdminOrder>(`/orders/admin/${orderId}/handle-return`, { action });
      setOrders(orders.map(o => 
        o._id === orderId ? response : o
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to handle return request');
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-primary-red mx-auto mb-4" />
          <p className="text-silver-white">Admin access required</p>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => 
    filterStatus === 'All' || o.orderStatus === filterStatus
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full bg-black text-silver-white py-16"
    >
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Admin Order Dashboard</h1>

        {/* Filter Bar */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['All', ...statusOptions].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full font-semibold transition-all whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-primary-red text-black'
                  : 'bg-matte-black border border-primary-red/30 text-silver-white hover:border-primary-red'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-matte-black border border-primary-red/20 rounded-2xl p-4">
            <p className="text-silver-white/60 text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-primary-red">{orders.length}</p>
          </div>
          {['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map(status => (
            <div key={status} className="bg-matte-black border border-primary-red/20 rounded-2xl p-4">
              <p className="text-silver-white/60 text-sm">{status}</p>
              <p className="text-2xl font-bold text-silver-white">
                {orders.filter(o => o.orderStatus === status).length}
              </p>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-primary-red/20 border-t-primary-red rounded-full" />
            </div>
            <p className="text-silver-white/60 mt-4">Loading orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="space-y-3">
            {filteredOrders.map(order => (
              <motion.div
                key={order._id}
                layout
                className="bg-matte-black border border-primary-red/20 rounded-2xl overflow-hidden"
              >
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-black/70 transition-colors text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">Order #{order._id.slice(-8)}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusColors[order.orderStatus] || 'bg-gray-500/20 border-gray-500'}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-silver-white/60 text-sm">
                      {order.user?.name || 'Deleted User'} • {order.items.length} items • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-primary-red">{formatINR(order.totals.grandTotal)}</p>
                    <p className="text-silver-white/60 text-sm">{order.paymentInfo.method}</p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-silver-white/60 transition-transform ${
                      expandedOrder === order._id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Order Details */}
                {expandedOrder === order._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-primary-red/20 p-4 space-y-4 bg-black/50"
                  >
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-semibold text-silver-white mb-2">Customer</h4>
                      <p className="text-silver-white">{order.user?.name || 'Deleted User'}</p>
                      <p className="text-silver-white/60 text-sm">{order.user?.email || 'N/A'}</p>
                    </div>

                    {/* Items */}
                    <div>
                      <h4 className="font-semibold text-silver-white mb-2">Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm bg-black/70 p-2 rounded-lg">
                            <span className="text-silver-white">{item.product?.title || 'Unknown Product'} x{item.quantity}</span>
                            <span className="text-primary-red">{formatINR(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-semibold text-silver-white mb-2">Shipping</h4>
                      <p className="text-silver-white text-sm">{order.shippingAddress.street}</p>
                      <p className="text-silver-white text-sm">{order.shippingAddress.city}</p>
                    </div>

                    {/* Return Action Panel */}
                    {order.returnRequest && order.returnRequest.status === 'Requested' && (
                      <div className="bg-primary-red/10 border border-primary-red/30 rounded-2xl p-4 space-y-3">
                        <p className="text-sm font-semibold text-primary-red">Return & Refund Requested</p>
                        <p className="text-sm text-silver-white/80"><span className="font-semibold text-silver-white">Reason:</span> {order.returnRequest.reason}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={updatingOrder === order._id}
                            onClick={() => handleReturnAction(order._id, 'Approved')}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                          >
                            Approve Return & Refund
                          </button>
                          <button
                            type="button"
                            disabled={updatingOrder === order._id}
                            onClick={() => handleReturnAction(order._id, 'Rejected')}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                          >
                            Reject Request
                          </button>
                        </div>
                      </div>
                    )}

                    {order.returnRequest && order.returnRequest.status !== 'None' && order.returnRequest.status !== 'Requested' && (
                      <div className="bg-matte-black border border-silver-white/10 rounded-2xl p-4 space-y-2">
                        <p className="text-sm font-semibold text-silver-white/60">Return Request Resolved</p>
                        <p className="text-sm text-silver-white/80">
                          <span className="font-semibold text-silver-white">Status:</span>{' '}
                          <span className={order.returnRequest.status === 'Approved' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                            {order.returnRequest.status}
                          </span>
                        </p>
                        <p className="text-sm text-silver-white/80"><span className="font-semibold text-silver-white">Reason:</span> {order.returnRequest.reason}</p>
                      </div>
                    )}

                    {/* Status Update */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-silver-white/60 mb-2">Order Status</label>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          disabled={updatingOrder === order._id}
                          className="w-full bg-black/70 border border-primary-red/30 rounded-lg px-3 py-2 text-silver-white text-sm focus:outline-none focus:border-primary-red disabled:opacity-60"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-silver-white/60 mb-2">Tracking Number</label>
                        <input
                          type="text"
                          placeholder="e.g., TRK123456789"
                          defaultValue={order.trackingNumber || ''}
                          onBlur={(e) => {
                            if (e.target.value !== order.trackingNumber) {
                              updateTrackingNumber(order._id, e.target.value);
                            }
                          }}
                          disabled={updatingOrder === order._id}
                          className="w-full bg-black/70 border border-primary-red/30 rounded-lg px-3 py-2 text-silver-white text-sm focus:outline-none focus:border-primary-red disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-silver-white/40 mx-auto mb-4" />
            <p className="text-silver-white/60">No orders found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
