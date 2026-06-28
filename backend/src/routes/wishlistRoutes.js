const express = require("express");
const wishlist = require("../controllers/wishlistController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", wishlist.getWishlist);
router.post("/", wishlist.addToWishlist);
router.delete("/:productId", wishlist.removeFromWishlist);

module.exports = router;
