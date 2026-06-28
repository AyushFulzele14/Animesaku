import { Router } from 'express';
import {
  getAllOrders,
  updateOrderStatus,
  actionReturnRequest,
  getAllUsers,
  getAnalytics,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Apply auth protection and admin authorize middleware globally to all dashboard paths
router.use(protect);
router.use(authorize('admin'));

// Analytical dashboard reports
router.get('/analytics', getAnalytics);

// Global customer order trackers
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.patch('/orders/:id/return', actionReturnRequest);

// Global users directory
router.get('/users', getAllUsers);

export default router;
