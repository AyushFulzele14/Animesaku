const Wishlist = require("../models/Wishlist");
const asyncHandler = require("../utils/asyncHandler");

exports.getWishlist = asyncHandler(async (req, res) => {
  const data = await Wishlist.findOne({ user: req.user._id }).populate("products");
  res.json({ success: true, data: data || { products: [] } });
});

exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const data = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $addToSet: { products: productId } },
    { upsert: true, new: true }
  ).populate("products");
  res.json({ success: true, data });
});

exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const data = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { products: req.params.productId } },
    { new: true }
  ).populate("products");
  res.json({ success: true, data });
});
