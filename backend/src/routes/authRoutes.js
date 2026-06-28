const express = require("express");
const auth = require("../controllers/authController");

const router = express.Router();

router.post("/signup", auth.signup);
router.post("/login", auth.login);
router.post("/refresh-token", auth.refreshToken);
router.post("/logout", auth.logout);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password/:token", auth.resetPassword);

module.exports = router;
