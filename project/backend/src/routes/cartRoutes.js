import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
} from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Apply auth protection middleware to all cart endpoints
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .patch(updateCartQuantity);

router.delete('/:productId', removeFromCart);

export default router;
