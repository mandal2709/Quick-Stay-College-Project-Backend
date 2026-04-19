const express = require("express");
const {
  login,
  signup,
  getCurrentUser,
  logout,
  refreshToken,
} = require("../controller/auth");
const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/me", getCurrentUser);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

module.exports = router;
