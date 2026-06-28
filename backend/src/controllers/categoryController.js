const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const slugify = (str = "") => str.toLowerCase().trim().replace(/\s+/g, "-");

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({ name: req.body.name, slug: slugify(req.body.name) });
  res.status(201).json({ success: true, data: category });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, slug: slugify(req.body.name) },
    { new: true, runValidators: true }
  );
  if (!category) throw new ApiError(404, "Category not found");
  res.json({ success: true, data: category });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");
  await Subcategory.deleteMany({ category: category._id });
  res.json({ success: true, message: "Category deleted" });
});

exports.getCategories = asyncHandler(async (_req, res) => {
  const data = await Category.find().sort("name");
  res.json({ success: true, data });
});

exports.createSubcategory = asyncHandler(async (req, res) => {
  const data = await Subcategory.create({
    name: req.body.name,
    slug: slugify(req.body.name),
    category: req.body.categoryId,
  });
  res.status(201).json({ success: true, data });
});

exports.getSubcategories = asyncHandler(async (req, res) => {
  const query = req.query.category ? { category: req.query.category } : {};
  const data = await Subcategory.find(query).populate("category", "name");
  res.json({ success: true, data });
});
