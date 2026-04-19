const express = require("express");
const {
  getAllRooms,
  getRoomById,
  addReview,
  createRoom,
  getRoomsByOwner,
  updateRoom,
} = require("../controller/rooms");
const verifyToken = require("../middleware/auth");
const upload = require("../middleware/multer");

const router = express.Router();

// Get all rooms (public)
router.get("/", getAllRooms);

// Get owner's rooms (requires authentication) - must come before /:id
router.get("/my-rooms", verifyToken, getRoomsByOwner);

// Get room by ID (public)
router.get("/:id", getRoomById);

// Add review to room (requires authentication)
router.post("/:id/reviews", verifyToken, addReview);

// Create a new room (requires authentication)
router.post("/", verifyToken, upload.array("images", 4), createRoom);

// Update a room (requires authentication)
router.put("/:id", verifyToken, upload.array("images", 4), updateRoom);

module.exports = router;
