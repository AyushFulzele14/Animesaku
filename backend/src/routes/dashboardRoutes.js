const express = require("express");
const dashboard = require("../controllers/dashboardController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("admin"), dashboard.getDashboardStats);

module.exports = router;
