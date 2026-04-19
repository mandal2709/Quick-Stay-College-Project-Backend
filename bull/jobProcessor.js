const Bookings = require("../model/Bookings");
const Rooms = require("../model/Room");

const expireBooking = async () => {
  try {
    const currentTime = new Date();

    console.log("🕒 Current Time:", currentTime);

    // 1️⃣ Find all expired bookings
    const expiredBookings = await Bookings.find({
      checkOut: { $lt: currentTime },
    });

    console.log("📦 Expired bookings found:", expiredBookings.length);

    if (expiredBookings.length === 0) {
      return { message: "No expired bookings" };
    }

    // 2️⃣ Loop through each booking
    for (const booking of expiredBookings) {
      console.log(`❌ Deleting booking: ${booking._id}`);

      // 3️⃣ Remove booking from Room
      await Rooms.updateOne(
        { _id: booking.room },
        {
          $pull: { bookings: booking._id },
        },
      );

      // 4️⃣ Delete booking
      await Bookings.findByIdAndDelete(booking._id);
    }

    return {
      message: "Expired bookings cleaned",
      count: expiredBookings.length,
    };
  } catch (err) {
    console.error("❌ Error in expireBooking:", err);
    throw err;
  }
};

module.exports = {
  expireBooking,
};
