import { Router } from 'express';
import { getAllCategories } from '../controllers/categoryController.js';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/multer.js';

const router = Router();

// Public route to fetch all categories
router.get('/', getAllCategories);

// Admin Category Mutations (REST endpoints matching frontend category admin panels)
router.post('/', protect, authorize('admin'), upload.single('image'), createCategory);

router.route('/:id')
  .patch(protect, authorize('admin'), upload.single('image'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

export default router;
