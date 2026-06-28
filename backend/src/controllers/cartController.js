const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const calcTotal = (items) => items.reduce((sum, i) => sum + i.price * i.quantity, 0);

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  res.json({ success: true, data: cart || { items: [], totalAmount: 0 } });
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const index = cart.items.findIndex((i) => i.product.toString() === productId);
  if (index >= 0) cart.items[index].quantity += Number(quantity);
  else cart.items.push({ product: productId, quantity: Number(quantity), price: product.discountPrice || product.price });

  cart.totalAmount = calcTotal(cart.items);
  await cart.save();
  res.json({ success: true, data: cart });
});

exports.updateQuantity = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new ApiError(404, "Item not found in cart");
  item.quantity = Number(quantity);
  cart.totalAmount = calcTotal(cart.items);
  await cart.save();
  res.json({ success: true, data: cart });
});

exports.removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  cart.totalAmount = calcTotal(cart.items);
  await cart.save();
  res.json({ success: true, data: cart });
});

exports.clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalAmount: 0 });
  res.json({ success: true, message: "Cart cleared" });
});
