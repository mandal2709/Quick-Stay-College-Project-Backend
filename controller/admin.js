const User = require("../model/User");
const Room = require("../model/Room");
const Booking = require("../model/Bookings");

const getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const roomCount = await Room.countDocuments();
    const bookingCount = await Booking.countDocuments();

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("user", "fullName email")
      .populate("room", "roomType pricePerNight")
      .lean();

    res
      .status(200)
      .json({ userCount, roomCount, bookingCount, recentBookings });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const approveRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    room.approvalStatus = "approved";
    await room.save();
    res.status(200).json({ message: "Room approved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const rejectRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    room.approvalStatus = "rejected";
    await room.save();
    res.status(200).json({ message: "Room rejected successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getStats,
  getUsers,
  approveRoom,
  rejectRoom,
};
