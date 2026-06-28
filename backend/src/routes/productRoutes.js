const express = require("express");
const product = require("../controllers/productController");
const review = require("../controllers/reviewController");
const upload = require("../middlewares/uploadMiddleware");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(product.getAllProducts)
  .post(protect, authorize("admin"), upload.array("images", 8), product.createProduct);

router
  .route("/:id")
  .get(product.getSingleProduct)
  .patch(protect, authorize("admin"), product.updateProduct)
  .delete(protect, authorize("admin"), product.deleteProduct);

router.post("/reviews", protect, review.addOrUpdateReview);
router.delete("/reviews/:productId", protect, review.deleteReview);

module.exports = router;
