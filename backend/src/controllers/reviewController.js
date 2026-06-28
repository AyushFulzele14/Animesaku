const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const recalculateRatings = (product) => {
  product.numOfReviews = product.reviews.length;
  product.ratings = product.reviews.length
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0;
};

exports.addOrUpdateReview = asyncHandler(async (req, res) => {
  const { rating, comment, productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const existing = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (existing) {
    existing.rating = Number(rating);
    existing.comment = comment;
  } else {
    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });
  }

  recalculateRatings(product);
  await product.save();
  res.json({ success: true, message: "Review saved" });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) throw new ApiError(404, "Product not found");

  product.reviews = product.reviews.filter((r) => r.user.toString() !== req.user._id.toString());
  recalculateRatings(product);
  await product.save();
  res.json({ success: true, message: "Review deleted" });
});
