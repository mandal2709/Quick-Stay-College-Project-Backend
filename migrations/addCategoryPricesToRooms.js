const dotenv = require("dotenv");
const connectDB = require("../util/db");
const Room = require("../model/Room");

dotenv.config();

const runMigration = async () => {
  try {
    await connectDB();
    const rooms = await Room.find();
    let updatedCount = 0;

    for (const room of rooms) {
      const currentPrice = room.price || 0;
      let shouldUpdate = false;

      if (!room.categoryPrices || typeof room.categoryPrices !== "object") {
        room.categoryPrices = {
          simple: currentPrice,
          luxury: currentPrice,
          premium: currentPrice,
        };
        shouldUpdate = true;
      } else {
        if (room.categoryPrices.simple == null) {
          room.categoryPrices.simple = currentPrice;
          shouldUpdate = true;
        }
        if (room.categoryPrices.luxury == null) {
          room.categoryPrices.luxury = currentPrice;
          shouldUpdate = true;
        }
        if (room.categoryPrices.premium == null) {
          room.categoryPrices.premium = currentPrice;
          shouldUpdate = true;
        }
      }

      if (room.price == null || room.price === undefined) {
        room.price = currentPrice;
        shouldUpdate = true;
      }

      if (room.roomType !== undefined) {
        room.roomType = undefined;
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await room.save();
        updatedCount += 1;
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} rooms.`);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

runMigration();
