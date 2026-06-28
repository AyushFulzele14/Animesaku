import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { Category } from '../models/Category.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cache } from '../config/redis.js';
import { logger } from '../config/logger.js';

/**
 * Get All Products (with filters, pagination, search, sorting)
 */
export const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    animeName,
    type,
    minPrice,
    maxPrice,
    featured,
    trending,
    newArrival,
    sort = '-createdAt',
  } = req.query;

  const useCache =
    process.env.NODE_ENV === 'production' && req.query.refresh !== 'true';

  const cacheKey = `products:${JSON.stringify(req.query)}`;
  const cachedData = useCache ? await cache.get(cacheKey) : null;

  if (cachedData) {
    logger.info('Products retrieved from cache');
    return res.status(200).json(new ApiResponse(200, cachedData, 'Products retrieved successfully (cached)'));
  }

  const query = {};

  // Text search on Title, Description, animeName, and tags
  if (search) {
    query.$text = { $search: search };
  }

  // Exact Match filters
  if (category) {
    // Check if category is objectId or slug
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category;
    } else {
      const cat = await Category.findOne({ slug: category.toLowerCase() });
      if (cat) {
        query.category = cat._id;
      }
    }
  }

  if (animeName) {
    query.animeName = { $regex: new RegExp(animeName, 'i') };
  }

  if (type) {
    query.type = type;
  }

  // Boolean flags
  if (featured === 'true' || featured === true) {
    query.featured = true;
  }
  if (trending === 'true' || trending === true) {
    query.trending = true;
  }
  if (newArrival === 'true' || newArrival === true) {
    query.newArrival = true;
  }

  // Price range filters
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);

  // Execute query
  let productsQuery = Product.find(query)
    .populate('category', 'name slug')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // If text search, sort by text score by default if no explicit sort is passed
  if (search && sort === '-createdAt') {
    productsQuery = Product.find(query, { score: { $meta: 'textScore' } })
      .populate('category', 'name slug')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(Number(limit));
  }

  const products = await productsQuery;
  const total = await Product.countDocuments(query);

  const result = {
    products,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    totalProducts: total,
  };

  if (useCache) {
    await cache.set(cacheKey, products, 900);
  }

  // Note: The frontend useProducts.ts does `response.data.map(...)` directly, 
  // so we will return the products array directly under the success data block.
  return res
    .status(200)
    .json(new ApiResponse(200, products, 'Products retrieved successfully'));
});

/**
 * Get Product by ID
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id).populate('category', 'name slug');
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Fetch product reviews
  const reviews = await Review.find({ product: id }).sort('-createdAt');

  const productDetails = {
    ...product._doc,
    reviews,
  };

  return res.status(200).json(new ApiResponse(200, productDetails, 'Product details retrieved successfully'));
});

/**
 * Create Product Review & Rating
 */
export const createProductReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const user = req.user;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check if review already exists
  const alreadyReviewed = await Review.findOne({ product: id, user: user._id });
  
  if (alreadyReviewed) {
    // Update existing review
    alreadyReviewed.rating = rating;
    alreadyReviewed.comment = comment;
    await alreadyReviewed.save();

    return res.status(200).json(new ApiResponse(200, alreadyReviewed, 'Review updated successfully'));
  } else {
    // Create new review
    const review = await Review.create({
      product: id,
      user: user._id,
      name: user.name,
      rating,
      comment,
    });

    return res.status(201).json(new ApiResponse(201, review, 'Review created successfully'));
  }
});
