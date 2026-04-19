// // workers/hotel.worker.js
// const path = require("path");
// const dotenv = require("dotenv");
// const { Worker } = require("bullmq");
// const connectDB = require("../util/db");
// const { redisConnection } = require("./REDIS.js");
// const { expireBooking } = require("./jobProcessor.js");

// dotenv.config({ path: path.resolve(__dirname, "../.env") });

// const startWorker = async () => {
//   await connectDB();

//   const worker = new Worker(
//     "hotel-availability",
//     async (job) => {
//       return await expireBooking(job);
//     },
//     { connection: redisConnection },
//   );

//   console.log("Worker started...");

//   worker.on("completed", (job, result) => {
//     console.log(`Job completed: ${job.id}`);
//     console.log(result);
//   });

//   worker.on("failed", (job, err) => {
//     console.log(`Job failed: ${job.id}`, err);
//   });
// };

// startWorker().catch((err) => {
//   console.error("Failed to start worker:", err);
//   process.exit(1);
// });
