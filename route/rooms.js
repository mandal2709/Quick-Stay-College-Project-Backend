const express = require("express");
const {
  getAllRooms,
  getRoomById,
  addReview,
  createRoom,
  getRoomsByOwner,
  updateRoom,
  get5StarReviews,
  featuredRooms,
  discount,
  removeDiscount,
} = require("../controller/rooms");
const { getDiscountedRooms } = require("../controller/discountedRooms");
const verifyToken = require("../middleware/auth");
const { checkOwner } = require("../middleware/role");
const upload = require("../middleware/multer");

const router = express.Router();

// Get all rooms (public)
router.get("/", getAllRooms);

// Get owner's rooms (requires authentication) - must come before /:id
router.get("/my-rooms", verifyToken, getRoomsByOwner);

// Get discounted rooms (public) - must come before /:id
router.get("/discounted", getDiscountedRooms);

// Get 5-star reviews (public) - must come before /:id
router.get("/5-star-reviews", get5StarReviews);

// Get featured rooms (public) - must come before /:id
router.get("/featured-rooms", featuredRooms);

// Get room by ID (public)
router.get("/:id", getRoomById);

// Add review to room (requires authentication)
router.post("/:id/reviews", verifyToken, addReview);

// Create a new room (requires authentication)
router.post("/", verifyToken, upload.array("images", 4), createRoom);

// Update a room (requires authentication)
router.put("/:id", verifyToken, upload.array("images", 4), updateRoom);

// Apply discount to a room (requires authentication)
router.put("/:id/discount", verifyToken, checkOwner, discount);

// Remove discount from a room (requires authentication)
router.delete("/:id/discount", verifyToken, checkOwner, removeDiscount);

module.exports = router;
