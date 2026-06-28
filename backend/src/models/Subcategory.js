const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
  },
  { timestamps: true }
);

subcategorySchema.index({ name: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Subcategory", subcategorySchema);
