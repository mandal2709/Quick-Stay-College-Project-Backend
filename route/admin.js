const express = require("express");
const {
  getStats,
  getUsers,
  approveRoom,
  rejectRoom,
} = require("../controller/admin");
const verifyToken = require("../middleware/auth");
const { checkAdmin } = require("../middleware/role");

const router = express.Router();

// Admin-only endpoints
router.get("/stats", verifyToken, checkAdmin, getStats);
router.get("/users", verifyToken, checkAdmin, getUsers);
router.put("/approve-room/:id", verifyToken, checkAdmin, approveRoom);
router.put("/reject-room/:id", verifyToken, checkAdmin, rejectRoom);

module.exports = router;
