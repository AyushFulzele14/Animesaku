const express = require("express");
const category = require("../controllers/categoryController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", category.getCategories);
router.get("/subcategories", category.getSubcategories);

router.post("/", protect, authorize("admin"), category.createCategory);
router.patch("/:id", protect, authorize("admin"), category.updateCategory);
router.delete("/:id", protect, authorize("admin"), category.deleteCategory);
router.post("/subcategories", protect, authorize("admin"), category.createSubcategory);

module.exports = router;
