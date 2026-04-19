const Rooms = require("../model/Room");
const Bookings = require("../model/Bookings");

const checkAvailability = async (req, res) => {
  try {
    const { location, checkIn, checkOut } = req.body;

    if (!location || !checkIn || !checkOut) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const rooms = await Rooms.find({ location });

    const availableRooms = [];
    for (const room of rooms) {
      const overlappingBooking = await Bookings.findOne({
        room: room._id,
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn },
      });
      if (!overlappingBooking) {
        availableRooms.push(room);
      }
    }
    console.log("Available rooms:", availableRooms);
    res.status(200).json({ availableRooms });
  } catch (err) {
    res.status(500).json({ message: "Server error checking availability" });
  }
};

const checkAvailabilityById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { checkIn, checkOut } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: "missing room ID" });
    }

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const rooms = await Rooms.findById(roomId);
    if (!rooms) {
      return res.status(404).json({ message: "Room not found" });
    }

    const overlappingBooking = await Bookings.findOne({
      room: rooms._id,
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    });
    if (!overlappingBooking) {
      return res.status(200).json({ message: "Room is available" });
    } else {
      return res.status(400).json({ message: "Room is not available" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error checking availability" });
  }
};

module.exports = {
    checkAvailability,
    checkAvailabilityById,
};
