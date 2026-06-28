import Razorpay from 'razorpay';
import { logger } from './logger.js';

let razorpayInstance = null;

export const configureRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    logger.warn('Razorpay credentials not found in environment. Running in checkout mock/COD fallback mode.');
    return null;
  }

  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    logger.info('Razorpay initialized successfully');
  } catch (error) {
    logger.error(`Failed to initialize Razorpay: ${error.message}`);
  }

  return razorpayInstance;
};

export const getRazorpayInstance = () => razorpayInstance;
