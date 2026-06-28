const express = require("express");
const cart = require("../controllers/cartController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", cart.getCart);
router.post("/", cart.addToCart);
router.patch("/", cart.updateQuantity);
router.delete("/:productId", cart.removeFromCart);
router.delete("/", cart.clearCart);

module.exports = router;
