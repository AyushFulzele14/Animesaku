import crypto from 'crypto';
import { getRazorpayInstance } from '../config/razorpay.js';
import { logger } from '../config/logger.js';

/**
 * Creates a Razorpay Order
 * @param {string} receiptId - Unique order id reference
 * @param {number} amount - Amount in INR (will be converted to paise internally)
 */
export const createRazorpayOrder = async (receiptId, amount) => {
  const razorpay = getRazorpayInstance();

  if (!razorpay) {
    logger.info(`Pre-paid checkout simulating in offline mock mode for Receipt ID: ${receiptId}`);
    return {
      id: `mock_rzp_order_${crypto.randomBytes(6).toString('hex')}`,
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: receiptId,
      status: 'created',
      isMock: true,
    };
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // Razorpay accepts in paise (INR * 100)
      currency: 'INR',
      receipt: receiptId,
    };

    const order = await razorpay.orders.create(options);
    logger.info(`Razorpay order created successfully: ${order.id}`);
    return order;
  } catch (error) {
    logger.error(`Error creating Razorpay Order: ${error.message}`);
    throw error;
  }
};

/**
 * Verify Razorpay Signature authenticity
 */
export const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const razorpay = getRazorpayInstance();

  if (!razorpay) {
    // If running in Mock Mode, automatically authorize any mock transaction
    if (razorpayOrderId.startsWith('mock_rzp_order_')) {
      logger.info(`Mock Payment automatically verified for Order ID: ${razorpayOrderId}`);
      return true;
    }
    return false;
  }

  try {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isMatch = expectedSignature === razorpaySignature;
    logger.info(`Razorpay signature verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    return isMatch;
  } catch (error) {
    logger.error(`Error verifying payment signature: ${error.message}`);
    return false;
  }
};
