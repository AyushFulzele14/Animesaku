import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  downloadInvoice,
  requestReturn,
  getAllOrders,
  updateOrderStatus,
  addTrackingNumber,
  handleReturnRequest,
} from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { orderSchema } from '../utils/validators.js';

const router = Router();

// Apply authentication protection to all order endpoints
router.use(protect);

// Customer order endpoints
router.post('/create', validate(orderSchema), createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.get('/:id/invoice', downloadInvoice);
router.post('/:id/return', requestReturn);

// Admin order endpoints
router.get('/admin/all-orders', getAllOrders);
router.patch('/admin/:id/update-status', updateOrderStatus);
router.patch('/admin/:id/add-tracking', addTrackingNumber);
router.patch('/admin/:id/handle-return', handleReturnRequest);

export default router;
