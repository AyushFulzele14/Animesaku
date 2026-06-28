import { Category } from '../models/Category.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get All Categories
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');
  return res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved successfully'));
});
