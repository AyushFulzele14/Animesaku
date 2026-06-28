import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { Coupon } from '../models/Coupon.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createRazorpayOrder, verifyPaymentSignature } from '../services/paymentService.js';
import { generateHtmlInvoice } from '../services/invoiceService.js';
import { sendOrderConfirmationEmail, sendShippingNotificationEmail, sendDeliveryConfirmationEmail } from '../services/emailService.js';

/**
 * Place Order (Checkout cart)
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, couponCode } = req.body;
  const userId = req.user._id;

  // Retrieve user's cart
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Your shopping cart is empty');
  }

  let subtotal = 0;
  const orderItems = [];

  // Validate items and check stock availability
  for (const item of cart.items) {
    const product = item.product;
    if (!product) {
      throw new ApiError(404, 'One or more products in your cart do not exist');
    }

    if (product.stockQuantity < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for "${product.title}". Max available is ${product.stockQuantity}`
      );
    }

    // Determine correct item price
    const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
    subtotal += finalPrice * item.quantity;

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: finalPrice,
      finishType: item.finishType,
    });
  }

  // Calculate Shipping charges (Free shipping over ₹500, else standard ₹40)
  const shipping = subtotal >= 500 ? 0 : 40;

  // Validate coupon discount if supplied
  let discount = 0;
  let couponUsed = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && !coupon.isExpired() && subtotal >= coupon.minOrderAmount) {
      couponUsed = coupon._id;
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      } else {
        discount = coupon.discountValue;
      }
    }
  }

  const grandTotal = subtotal + shipping - discount;

  // 1. COD (Cash On Delivery) Checkout logic
  if (paymentMethod === 'COD') {
    // Lock inventory stock immediately
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentInfo: {
        method: 'COD',
        status: 'Pending',
      },
      totals: {
        subtotal,
        shipping,
        couponDiscount: discount,
        grandTotal,
      },
      couponUsed,
      orderStatus: 'Processing',
    });

    // Clear user shopping cart
    cart.items = [];
    await cart.save();

    // Send order confirmation email (non-blocking)
    try {
      await sendOrderConfirmationEmail(req.user, order);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError.message);
      // Continue with order even if email fails
    }

    return res.status(201).json(new ApiResponse(201, order, 'Order placed successfully (Cash on Delivery)'));
  }

  // 2. Pre-Paid Razorpay Checkout logic
  if (paymentMethod === 'Razorpay') {
    // Create Razorpay Order
    const receiptId = `rcpt_${Date.now()}`;
    const rzpOrder = await createRazorpayOrder(receiptId, grandTotal);

    // Create a temporary order in database (status: Pending)
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentInfo: {
        method: 'Razorpay',
        status: 'Pending',
        razorpayOrderId: rzpOrder.id,
      },
      totals: {
        subtotal,
        shipping,
        couponDiscount: discount,
        grandTotal,
      },
      couponUsed,
      orderStatus: 'Processing',
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          orderId: order._id,
          razorpayOrderId: rzpOrder.id,
          amount: rzpOrder.amount, // in paise
          currency: rzpOrder.currency,
          key: process.env.RAZORPAY_KEY_ID || 'mock_key',
          isMock: rzpOrder.isMock,
        },
        'Razorpay transaction order initialized'
      )
    );
  }

  throw new ApiError(400, 'Invalid payment method');
});

/**
 * Verify Razorpay payment signature & finalize prepaid order
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const userId = req.user._id;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Validate request is matching current user
  if (order.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'Unauthorized access to this order');
  }

  // Cryptographically verify signature
  const isVerified = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

  if (!isVerified) {
    order.paymentInfo.status = 'Failed';
    await order.save();
    throw new ApiError(400, 'Payment signature verification failed. Fraud attempt logged.');
  }

  // Stock lock deductions
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stockQuantity: -item.quantity },
    });
  }

  // Update order payment status
  order.paymentInfo.status = 'Paid';
  order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
  order.paymentInfo.razorpaySignature = razorpaySignature;
  await order.save();

  // Clear shopping cart
  await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

  // Send order confirmation email (non-blocking)
  try {
    const user = await Order.findById(orderId).populate('user');
    await sendOrderConfirmationEmail(user.user, order);
  } catch (emailError) {
    console.error('Error sending order confirmation email:', emailError.message);
    // Continue with order even if email fails
  }

  return res.status(200).json(new ApiResponse(200, order, 'Payment verified and order confirmed successfully'));
});

/**
 * Get User Orders History
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product', 'title images animeName type')
    .sort('-createdAt');

  return res.status(200).json(new ApiResponse(200, orders, 'Orders retrieved successfully'));
});

/**
 * Get Order Details by ID
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate('items.product', 'title images animeName type price')
    .populate('user', 'name email');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Restrict retrieval to order owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Unauthorized access to this order');
  }

  return res.status(200).json(new ApiResponse(200, order, 'Order details retrieved successfully'));
});

/**
 * Download Printable Invoice HTML
 */
export const downloadInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate('items.product', 'title animeName type')
    .populate('user', 'name email');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Unauthorized access to this order');
  }

  const htmlInvoice = generateHtmlInvoice(order);

  res.setHeader('Content-Type', 'text/html');
  return res.send(htmlInvoice);
});

/**
 * Initiate Order Return/Refund Request
 */
export const requestReturn = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized access to this order');
  }

  if (order.orderStatus !== 'Delivered') {
    throw new ApiError(400, 'Returns can only be requested for delivered orders');
  }

  if (order.returnRequest.status !== 'None') {
    throw new ApiError(400, 'Return request has already been filed for this order');
  }

  order.returnRequest = {
    reason,
    status: 'Requested',
    requestedAt: new Date(),
  };

  await order.save();

  return res.status(200).json(new ApiResponse(200, order, 'Return and refund request submitted successfully'));
});

/**
 * Admin: Get All Orders
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;

  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can view all orders');
  }

  const query = status ? { orderStatus: status } : {};

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('items.product', 'title price')
    .sort('-createdAt');

  return res.status(200).json(new ApiResponse(200, orders, 'All orders retrieved successfully'));
});

/**
 * Admin: Update Order Status
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can update order status');
  }

  if (!['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].includes(status)) {
    throw new ApiError(400, 'Invalid order status');
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { orderStatus: status },
    { new: true }
  )
    .populate('user', 'name email')
    .populate('items.product', 'title price');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Send notification emails based on status change
  try {
    if (status === 'Shipped' && order.trackingNumber) {
      await sendShippingNotificationEmail(order.user, order, order.trackingNumber);
    } else if (status === 'Delivered') {
      await sendDeliveryConfirmationEmail(order.user, order);
    }
  } catch (emailError) {
    console.error('Error sending status notification email:', emailError.message);
    // Continue with status update even if email fails
  }

  return res.status(200).json(new ApiResponse(200, order, 'Order status updated successfully'));
});

/**
 * Admin: Add Tracking Number
 */
export const addTrackingNumber = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { trackingNumber } = req.body;

  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can add tracking numbers');
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { 
      trackingNumber,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    { new: true }
  )
    .populate('user', 'name email')
    .populate('items.product', 'title price');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  return res.status(200).json(new ApiResponse(200, order, 'Tracking number added successfully'));
});

/**
 * Admin: Approve/Reject Return & Refund Request
 */
export const handleReturnRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'Approved' or 'Rejected'

  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can manage return requests');
  }

  if (!['Approved', 'Rejected'].includes(action)) {
    throw new ApiError(400, 'Invalid return action. Must be Approved or Rejected');
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.returnRequest.status !== 'Requested') {
    throw new ApiError(400, 'No active return request found for this order');
  }

  order.returnRequest.status = action;
  order.returnRequest.actionedAt = new Date();

  if (action === 'Approved') {
    order.orderStatus = 'Returned';
    // Restock the items back to inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity },
      });
    }
  }

  await order.save();

  const updatedOrder = await Order.findById(id)
    .populate('user', 'name email')
    .populate('items.product', 'title price');

  return res.status(200).json(new ApiResponse(200, updatedOrder, `Return request ${action.toLowerCase()} successfully`));
});
