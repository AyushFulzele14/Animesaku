import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get User Cart
 */
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'title price discountPrice images stockQuantity animeName type',
  });

  if (!cart) {
    // If somehow cart is missing, create a blank one
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Filter out any items where product might have been deleted from DB
  const initialCount = cart.items.length;
  cart.items = cart.items.filter((item) => item.product !== null);
  
  if (cart.items.length !== initialCount) {
    await cart.save();
  }

  return res.status(200).json(new ApiResponse(200, cart.items, 'Cart items retrieved successfully'));
});

/**
 * Add / Increment Item in Cart
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, finishType = 'matte' } = req.body;
  const userId = req.user._id;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (product.stockQuantity < quantity) {
    throw new ApiError(400, `Insufficient stock. Only ${product.stockQuantity} items left`);
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  // Check if item already exists in cart with same product and finish
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.finishType === finishType
  );

  if (itemIndex > -1) {
    // Increment quantity
    const newQty = cart.items[itemIndex].quantity + Number(quantity);
    if (product.stockQuantity < newQty) {
      throw new ApiError(400, `Cannot add more items. Max stock is ${product.stockQuantity}`);
    }
    cart.items[itemIndex].quantity = newQty;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity: Number(quantity),
      finishType,
    });
  }

  await cart.save();
  
  // Return updated populated items
  const updatedCart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'title price discountPrice images stockQuantity animeName type',
  });

  return res.status(200).json(new ApiResponse(200, updatedCart.items, 'Product added to cart successfully'));
});

/**
 * Update Cart Item Quantity
 */
export const updateCartQuantity = asyncHandler(async (req, res) => {
  const { productId, quantity, finishType = 'matte' } = req.body;
  const userId = req.user._id;

  if (Number(quantity) < 1) {
    throw new ApiError(400, 'Quantity must be at least 1');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (product.stockQuantity < Number(quantity)) {
    throw new ApiError(400, `Insufficient stock. Only ${product.stockQuantity} items left`);
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.finishType === finishType
  );

  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  cart.items[itemIndex].quantity = Number(quantity);
  await cart.save();

  const updatedCart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'title price discountPrice images stockQuantity animeName type',
  });

  return res.status(200).json(new ApiResponse(200, updatedCart.items, 'Cart quantity updated successfully'));
});

/**
 * Remove Product from Cart
 */
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { finishType = 'matte' } = req.query; // If multiple finishTypes exist
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  // Filter out the item matching productId and optionally finishType
  cart.items = cart.items.filter(
    (item) => !(item.product.toString() === productId && (!finishType || item.finishType === finishType))
  );

  await cart.save();

  const updatedCart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'title price discountPrice images stockQuantity animeName type',
  });

  return res.status(200).json(new ApiResponse(200, updatedCart.items, 'Item removed from cart successfully'));
});
