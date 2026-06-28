import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cache } from '../config/redis.js';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../config/logger.js';

const toPublicUploadUrl = (file) => `/uploads/${file.filename}`;

// Helper to clear cached products lists when mutations occur
const clearProductsCache = async () => {
  await cache.clearPattern('products:*');
};

/* =========================================================================
   1. PRODUCT MANAGEMENT
   ========================================================================= */

/**
 * Admin: Add New Product
 */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    animeName,
    category,
    price,
    discountPrice,
    stockQuantity,
    type,
    dimensions,
    materialQuality,
    finishType,
    featured,
    trending,
  } = req.body;

  const tagsRaw = req.body.tags ?? req.body['tags[]'];
  let tags = [];
  if (Array.isArray(tagsRaw)) {
    tags = tagsRaw.map((tag) => String(tag).trim()).filter(Boolean);
  } else if (typeof tagsRaw === 'string' && tagsRaw.trim()) {
    tags = tagsRaw.split(',').map((tag) => tag.trim()).filter(Boolean);
  }

  // Handle uploaded images (Multer stores files in req.files)
  const images = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      if (file.path) {
        images.push({
          public_id: file.filename || '',
          url: toPublicUploadUrl(file),
        });
      }
    }
  }

  // Fallback default image if none uploaded
  if (images.length === 0) {
    images.push({
      public_id: '',
      url: type === 'sticker' 
        ? 'https://images.pexels.com/photos/3616956/pexels-photo-3616956.jpeg?w=400&h=400&fit=crop'
        : 'https://images.pexels.com/photos/3587620/pexels-photo-3587620.jpeg?w=400&h=400&fit=crop',
    });
  }

  const parsedPrice = Number(price);
  const parsedDiscount = Number(discountPrice) || 0;

  const product = await Product.create({
    title,
    description,
    animeName,
    category,
    price: parsedPrice,
    discountPrice: parsedDiscount > 0 && parsedDiscount < parsedPrice ? parsedDiscount : 0,
    stockQuantity: Number(stockQuantity),
    type,
    dimensions,
    materialQuality,
    finishType: finishType || 'matte',
    featured: featured === 'true' || featured === true,
    trending: trending === 'true' || trending === true,
    tags,
    images,
  });

  await clearProductsCache();

  return res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

/**
 * Admin: Update Product Details
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Handle new images if uploaded
  if (req.files && req.files.length > 0) {
    const images = [];
    
    // Optional: Delete old images from Cloudinary if public_ids exist
    for (const oldImg of product.images) {
      if (oldImg.public_id) {
        try {
          await cloudinary.uploader.destroy(oldImg.public_id);
        } catch (e) {
          logger.error(`Failed to delete old image ${oldImg.public_id} from Cloudinary`);
        }
      }
    }

    for (const file of req.files) {
      images.push({
        public_id: file.filename || '',
        url: toPublicUploadUrl(file),
      });
    }
    
    updateData.images = images;
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
  await clearProductsCache();

  return res.status(200).json(new ApiResponse(200, updatedProduct, 'Product updated successfully'));
});

/**
 * Admin: Delete Product
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Clean up assets in Cloudinary
  if (product.images && Array.isArray(product.images)) {
    for (const img of product.images) {
      if (img.public_id) {
        try {
          await cloudinary.uploader.destroy(img.public_id);
        } catch (e) {
          logger.error(`Cloudinary deletion error for product: ${id}`);
        }
      }
    }
  }

  await Product.findByIdAndDelete(id);
  await clearProductsCache();

  return res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});

/* =========================================================================
   2. CATEGORY CRUD
   ========================================================================= */

const toCategorySlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

/**
 * Admin: Create Category
 */
export const createCategory = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();

  if (name.length < 2) {
    throw new ApiError(400, 'Category name must be at least 2 characters');
  }

  const slug = toCategorySlug(name);

  const existing = await Category.findOne({
    $or: [{ name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }, { slug }],
  });

  if (existing) {
    throw new ApiError(400, 'Category with this name already exists');
  }

  const category = await Category.create({ name, slug });
  return res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});

/**
 * Admin: Update Category
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const name = String(req.body.name || '').trim();

  if (name.length < 2) {
    throw new ApiError(400, 'Category name must be at least 2 characters');
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const slug = toCategorySlug(name);
  const duplicate = await Category.findOne({
    _id: { $ne: id },
    $or: [{ name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }, { slug }],
  });

  if (duplicate) {
    throw new ApiError(400, 'Category with this name already exists');
  }

  category.name = name;
  category.slug = slug;
  await category.save();

  await clearProductsCache();

  return res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
});

/**
 * Admin: Delete Category
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Check if any product is using this category
  const productsCount = await Product.countDocuments({ category: id });
  if (productsCount > 0) {
    throw new ApiError(400, `Cannot delete category. There are ${productsCount} products assigned to it.`);
  }

  await Category.findByIdAndDelete(id);
  return res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
});

/* =========================================================================
   3. ORDER MUTATIONS
   ========================================================================= */

/**
 * Admin: Get All Orders (Paginated, Filterable)
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = {};
  if (status) {
    query.orderStatus = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('items.product', 'title animeName type price')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  const total = await Order.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
        totalOrders: total,
      },
      'All orders fetched successfully'
    )
  );
});

/**
 * Admin: Transition Order Status
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.orderStatus = orderStatus;
  
  if (orderStatus === 'Shipped') {
    order.shippedAt = new Date();
  } else if (orderStatus === 'Delivered') {
    order.deliveredAt = new Date();
    order.paymentInfo.status = 'Paid'; // Automatically mark delivered prepaid/COD as Paid
  }

  await order.save();

  return res.status(200).json(new ApiResponse(200, order, `Order status updated to '${orderStatus}' successfully`));
});

/**
 * Admin: Accept / Reject Return & Refund Request
 */
export const actionReturnRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Approved' or 'Rejected'

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.returnRequest.status !== 'Requested') {
    throw new ApiError(400, 'No active return request filed for this order');
  }

  order.returnRequest.status = status;
  order.returnRequest.actionedAt = new Date();

  if (status === 'Approved') {
    order.orderStatus = 'Returned';
    order.paymentInfo.status = 'Refunded';

    // Restock the inventory since items were returned
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity },
      });
    }
    await clearProductsCache();
  }

  await order.save();

  return res.status(200).json(new ApiResponse(200, order, `Return request status updated to '${status}' successfully`));
});

/* =========================================================================
   4. USER MANAGEMENT
   ========================================================================= */

/**
 * Admin: Get All Registered Users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort('-createdAt');
  return res.status(200).json(new ApiResponse(200, users, 'Registered users retrieved successfully'));
});

/* =========================================================================
   5. ANALYTICS & SALES REPORTING
   ========================================================================= */

/**
 * Admin: Get Financial & Inventory Performance Analytics
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  // Aggregate 1: Total Sales and Revenue
  const salesStats = await Order.aggregate([
    {
      $match: { 'paymentInfo.status': 'Paid', orderStatus: { $ne: 'Returned' } },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totals.grandTotal' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const revenue = salesStats[0]?.totalRevenue || 0;
  const totalCompletedOrders = salesStats[0]?.totalOrders || 0;

  // Aggregate 2: Category sales ratio
  const categoryStats = await Order.aggregate([
    { $match: { 'paymentInfo.status': 'Paid' } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    { $unwind: '$productDetails' },
    {
      $lookup: {
        from: 'categories',
        localField: 'productDetails.category',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    { $unwind: '$categoryDetails' },
    {
      $group: {
        _id: '$categoryDetails.name',
        salesCount: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
  ]);

  // Inventory Tracker: Count items running low on stock (Quantity < 5)
  const lowStockAlerts = await Product.find({ stockQuantity: { $lt: 5 } })
    .select('title stockQuantity type price')
    .limit(10);

  const stats = {
    totalRevenue: Math.round(revenue * 100) / 100,
    totalPaidOrders: totalCompletedOrders,
    totalProductsCount: await Product.countDocuments(),
    totalUsersCount: await User.countDocuments({ role: 'customer' }),
    lowStockItemsCount: await Product.countDocuments({ stockQuantity: { $lt: 5 } }),
    lowStockList: lowStockAlerts,
    categorySalesBreakdown: categoryStats,
  };

  return res.status(200).json(new ApiResponse(200, stats, 'Store analytics generated successfully'));
});

/* =========================================================================
   6. COUPON CRUD
   ========================================================================= */

/**
 * Admin: Create Coupon Code
 */
export const createCoupon = asyncHandler(async (req, res) => {
  const couponData = req.body;

  const existing = await Coupon.findOne({ code: couponData.code.toUpperCase() });
  if (existing) {
    throw new ApiError(400, 'A coupon with this code already exists');
  }

  const coupon = await Coupon.create(couponData);
  return res.status(201).json(new ApiResponse(201, coupon, 'Coupon code created successfully'));
});

/**
 * Admin: Delete Coupon Code
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon code not found');
  }

  return res.status(200).json(new ApiResponse(200, null, 'Coupon code deleted successfully'));
});
