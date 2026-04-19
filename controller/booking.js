const Booking = require("../model/Bookings");
const Room = require("../model/Room");
const User = require("../model/User");

const createBooking = async (req, res) => {
  try {
    const user = req.user.id; // From auth middleware
    const { room, checkIn, checkOut, guests, totalPrice } = req.body;
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not authenticated. Please log in first." });
    }
    if (!room) {
      return res.status(400).json({ message: "Room ID is required" });
    }
    if (!room || !checkIn || !checkOut || !guests || !totalPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const booking = new Booking({
      room,
      checkIn,
      checkOut,
      guests,
      isActive: true,
      user,
      totalPrice,
    });
    const savedBooking = await booking.save();

    const allotRoom = await Room.findById(room);
    if (allotRoom) {
      allotRoom.bookings.push(savedBooking._id);
      await allotRoom.save();
      res.status(201).json({
        message: "Booking created successfully",
        booking: savedBooking,
      });
    } else {
      // If room not found, delete the booking and return error
      await Booking.findByIdAndDelete(savedBooking._id);
      return res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const bookings = await Booking.find({ user: userId })
      .populate("room")
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

const getBookingByOwner = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const rooms = await Room.find({ owner: userId });
    const roomIds = rooms.map((room) => room._id);
    const bookings = await Booking.find({ room: { $in: roomIds } })
      .populate("room")
      .populate("user")
      .sort({ createdAt: -1 });
    
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const totalBookings = bookings.length;
    res.status(200).json({ bookings, totalRevenue, totalBookings });
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id; // From auth middleware
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to cancel this booking" });
    }
    await Booking.findByIdAndUpdate(bookingId, { status: "cancelled" });
    await Room.findByIdAndUpdate(booking.room, {
      $pull: { bookings: bookingId },
    });
    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling booking", error });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingByOwner,
  cancelBooking,
};
