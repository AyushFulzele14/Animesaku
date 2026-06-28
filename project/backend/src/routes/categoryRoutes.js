import { Router } from 'express';
import { getAllCategories } from '../controllers/categoryController.js';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Public route to fetch all categories
router.get('/', getAllCategories);

// Admin Category Mutations (REST endpoints matching frontend category admin panels)
router.post('/', protect, authorize('admin'), createCategory);

router.route('/:id')
  .patch(protect, authorize('admin'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

export default router;
