const express = require("express");
const router = express.Router();

const {
  createBooking,
  getUserBookings,
  getBookingByOwner,
  cancelBooking,
} = require("../controller/booking");
const verifyToken = require("../middleware/auth");
const { checkAvailabilityById } = require("../middleware/availability");
const { checkOwner } = require("../middleware/role");

router.post(
  "/create-booking/:roomId",
  verifyToken,
  checkAvailabilityById,
  createBooking,
);
router.get("/user-bookings", verifyToken, getUserBookings);
router.get("/owner-bookings", verifyToken, checkOwner, getBookingByOwner);
router.put("/cancel-booking/:id", verifyToken, cancelBooking);

module.exports = router;
