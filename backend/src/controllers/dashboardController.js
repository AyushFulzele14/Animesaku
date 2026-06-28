const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

exports.getDashboardStats = asyncHandler(async (_req, res) => {
  const [totalUsers, totalOrders, totalProducts] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments(),
  ]);

  const revenueAgg = await Order.aggregate([
    { $match: { paymentStatus: { $in: ["Paid", "COD"] } } },
    { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
  ]);

  const monthlySales = await Order.aggregate([
    { $match: { paymentStatus: { $in: ["Paid", "COD"] } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        totalSales: { $sum: "$totalAmount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const bestSellingProducts = await Order.aggregate([
    { $unwind: "$orderedProducts" },
    {
      $group: {
        _id: "$orderedProducts.product",
        totalQty: { $sum: "$orderedProducts.quantity" },
      },
    },
    { $sort: { totalQty: -1 } },
    { $limit: 10 },
  ]);

  const lowInventory = await Product.find({ stockQuantity: { $lte: 10 } })
    .select("title stockQuantity")
    .sort("stockQuantity");

  res.json({
    success: true,
    data: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: revenueAgg[0]?.revenue || 0,
      monthlySales,
      bestSellingProducts,
      inventoryTracking: lowInventory,
    },
  });
});
