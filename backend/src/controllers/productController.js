const Product = require("../models/Product");
const ApiFeatures = require("../utils/ApiFeatures");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");
const { uploadImageBuffer, deleteImage } = require("../services/cloudinaryService");

exports.createProduct = asyncHandler(async (req, res) => {
  const images = [];
  if (req.files?.length) {
    const cloudinaryConfigured =
      env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret;

    if (cloudinaryConfigured) {
      for (const file of req.files) {
        const uploaded = await uploadImageBuffer(file.buffer, "anime-products");
        images.push({ public_id: uploaded.public_id, url: uploaded.secure_url });
      }
    }
  }

  const rawTags = req.body.tags ?? req.body["tags[]"] ?? [];
  const tags = Array.isArray(rawTags)
    ? rawTags
    : typeof rawTags === "string"
      ? [rawTags]
      : [];

  const data = await Product.create({ ...req.body, images, tags });
  res.status(201).json({ success: true, data });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const data = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!data) throw new ApiError(404, "Product not found");
  res.json({ success: true, data });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const data = await Product.findById(req.params.id);
  if (!data) throw new ApiError(404, "Product not found");
  for (const image of data.images) await deleteImage(image.public_id);
  await data.deleteOne();
  res.json({ success: true, message: "Product deleted" });
});

exports.getSingleProduct = asyncHandler(async (req, res) => {
  const data = await Product.findById(req.params.id).populate("category subcategory");
  if (!data) throw new ApiError(404, "Product not found");
  res.json({ success: true, data });
});

exports.getAllProducts = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Product.find().populate("category subcategory"), req.query)
    .search()
    .filter()
    .sort()
    .paginate();

  const data = await features.query;
  const total = await Product.countDocuments();

  res.json({
    success: true,
    count: data.length,
    total,
    pagination: features.pagination,
    data,
  });
});
