import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get User Wishlist
 */
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'title price discountPrice images stockQuantity animeName type ratings',
  });

  return res.status(200).json(new ApiResponse(200, user.wishlist, 'Wishlist retrieved successfully'));
});

/**
 * Toggle Product in Wishlist (Add if not exists, remove if exists)
 */
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = req.user;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const index = user.wishlist.indexOf(productId);
  let message = '';
  
  if (index > -1) {
    // Remove from wishlist
    user.wishlist.splice(index, 1);
    message = 'Product removed from wishlist';
  } else {
    // Add to wishlist
    user.wishlist.push(productId);
    message = 'Product added to wishlist';
  }

  await user.save();

  return res.status(200).json(new ApiResponse(200, user.wishlist, message));
});
