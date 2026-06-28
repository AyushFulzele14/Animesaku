import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Protect all wishlist endpoints
router.use(protect);

router.get('/', getWishlist);
router.post('/:productId', toggleWishlist);

export default router;
