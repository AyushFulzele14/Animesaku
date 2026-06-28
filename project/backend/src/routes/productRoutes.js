import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProductReview,
} from '../controllers/productController.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { reviewSchema, productSchema } from '../utils/validators.js';
import { upload } from '../middlewares/multer.js';

const router = Router();

// Public Catalog Queries
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected Customer Reviews
router.post('/:id/reviews', protect, validate(reviewSchema), createProductReview);

// Admin-Only Product Mutations (REST endpoints matching frontend uploads)
router.post(
  '/', 
  protect, 
  authorize('admin'), 
  upload.array('images', 5), 
  validate(productSchema), 
  createProduct
);

router.route('/:id')
  .patch(
    protect, 
    authorize('admin'), 
    upload.array('images', 5), 
    updateProduct
  )
  .delete(
    protect, 
    authorize('admin'), 
    deleteProduct
  );

export default router;
