// // bull/scheduler.js

// const { hotelQueue } = require("./bullOueue");

// const startScheduler = async () => {
//   await hotelQueue.add(
//     "cleanup-bookings",
//     {},
//     {
//       repeat: {
//         //pattern: "0 0 * * *", // 🕛 every night
//         pattern: "*/1 * * * *", // every 1 minute
//         tz: "Asia/Kolkata", // ✅ India timezone
//       },
//       removeOnComplete: true,
//       removeOnFail: true,
//     },
//   );

//   console.log("🕛 Nightly cleanup job scheduled");
// };

// module.exports = { startScheduler };
