const Rooms = require("../model/Room");
const Bookings = require("../model/Bookings");

const checkAvailability = async (req, res) => {
  try {
    const { location, checkIn, checkOut, guests } = req.body;
    const requestedGuests = Number(guests ?? 1);

    if (!location || !checkIn || !checkOut) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (req.body.guests != null && (Number.isNaN(requestedGuests) || requestedGuests <= 0)) {
      return res.status(400).json({ message: "Invalid guests value" });
    }

    const sanitizedLocation = location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const locationRegex = new RegExp(`^${sanitizedLocation}$`, "i");
    const rooms = await Rooms.find({ location: locationRegex });

    const availableRooms = [];
    for (const room of rooms) {
      const overlappingBooking = await Bookings.findOne({
        room: room._id,
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn },
      });

      const hasGuestCapacity =
        requestedGuests <=
        Math.max(
          room.categoryGuestLimits?.simple ?? 1,
          room.categoryGuestLimits?.luxury ?? 1,
          room.categoryGuestLimits?.premium ?? 1,
        );

      if (!overlappingBooking && hasGuestCapacity) {
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
    const { checkIn, checkOut, guests, category } = req.body;
    const requestedGuests = Number(guests ?? 1);

    if (!roomId) {
      return res.status(400).json({ message: "missing room ID" });
    }

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (req.body.guests != null && (Number.isNaN(requestedGuests) || requestedGuests <= 0)) {
      return res.status(400).json({ message: "Invalid guests value" });
    }

    const room = await Rooms.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const overlappingBooking = await Bookings.findOne({
      room: room._id,
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    });

    const capacityForCategory = category
      ? Number(room.categoryGuestLimits?.[category] ?? 0)
      : Math.max(
          room.categoryGuestLimits?.simple ?? 1,
          room.categoryGuestLimits?.luxury ?? 1,
          room.categoryGuestLimits?.premium ?? 1,
        );

    if (requestedGuests > capacityForCategory) {
      return res.status(400).json({
        message: `Requested guest count exceeds room capacity (${capacityForCategory}).`,
      });
    }

    if (!overlappingBooking) {
      return res.status(200).json({ message: "Room is available" });
    }

    return res.status(400).json({ message: "Room is not available" });
  } catch (err) {
    res.status(500).json({ message: "Server error checking availability" });
  }
};

module.exports = {
    checkAvailability,
    checkAvailabilityById,
};
