const dotenv = require("dotenv");
const connectDB = require("../util/db");
const Room = require("../model/Room");

dotenv.config();

// Function to generate random price based on base price
const generateRandomPrice = (basePrice, multiplier) => {
  const variance = 0.1; // 10% variance
  const randomVariance = (Math.random() - 0.5) * 2 * variance; // Random between -10% and +10%
  const price = basePrice * multiplier * (1 + randomVariance);
  return Math.round(price);
};

const runMigration = async () => {
  try {
    await connectDB();

    // Find rooms where categoryPrices are missing or all zeros
    const rooms = await Room.find({
      $or: [
        { categoryPrices: { $exists: false } },
        {
          $and: [
            { "categoryPrices.simple": { $in: [null, 0, undefined] } },
            { "categoryPrices.luxury": { $in: [null, 0, undefined] } },
            { "categoryPrices.premium": { $in: [null, 0, undefined] } },
          ],
        },
      ],
    });

    console.log(`Found ${rooms.length} rooms without categoryPrices`);

    let updatedCount = 0;

    for (const room of rooms) {
      const basePrice = room.price || 100; // Default base price if not set

      // Generate prices for each category with random variation
      const newCategoryPrices = {
        simple: generateRandomPrice(basePrice, 1.0), // Base price
        luxury: generateRandomPrice(basePrice, 1.5), // 50% more expensive
        premium: generateRandomPrice(basePrice, 2.0), // 100% more expensive (double)
      };

      room.categoryPrices = newCategoryPrices;
      await room.save();

      console.log(`✓ Updated room: ${room.title}`);
      console.log(`  Base Price: ${basePrice}`);
      console.log(
        `  Simple: ${newCategoryPrices.simple}, Luxury: ${newCategoryPrices.luxury}, Premium: ${newCategoryPrices.premium}`,
      );

      updatedCount += 1;
    }

    console.log(
      `\n✅ Migration complete. Updated ${updatedCount} rooms with random category prices.`,
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

runMigration();
