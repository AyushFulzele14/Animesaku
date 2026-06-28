const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    animeName: { type: String, required: true, trim: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, index: true },
    discountPrice: { type: Number, default: 0 },
    stockQuantity: { type: Number, required: true, min: 0, index: true },
    images: [{ public_id: String, url: String }],
    type: { type: String, enum: ["poster", "sticker"], required: true },
    dimensions: { type: String, required: true },
    materialQuality: { type: String, required: true },
    tags: [{ type: String, trim: true, index: true }],
    featured: { type: Boolean, default: false, index: true },
    trending: { type: Boolean, default: false, index: true },
    ratings: { type: Number, default: 0, index: true },
    numOfReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

productSchema.index({ title: "text", animeName: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
