const Room = require("../model/Room");

const getDiscountedRooms = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

    const query = Room.find({ discount: { $gt: 0 } })
      .select(
        "_id title location price images discount description categoryPrices",
      )
      .sort({ discount: -1 });

    if (limit && limit > 0) {
      query.limit(limit);
    }

    const rooms = await query.exec();
    return res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching discounted rooms:", error);
    res.status(500).json({
      message: "Server error while fetching discounted rooms",
      error: error.message,
    });
  }
};

module.exports = {
  getDiscountedRooms,
};
