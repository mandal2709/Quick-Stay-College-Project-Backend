const Rooms = require("../model/Room");
const Bookings = require("../model/Bookings");

const checkAvailabilityById = async (req, res, next) => {
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
  if (overlappingBooking) {
    return res
      .status(409)
      .json({ message: "Room is not available on the selected dates" });
  }
  next();
};

module.exports = {
  checkAvailabilityById,
};
