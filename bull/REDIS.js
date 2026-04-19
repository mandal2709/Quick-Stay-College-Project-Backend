// // bull/REDIS.js
// const IORedis = require("ioredis");

// const redisConnection = new IORedis(
//   "redis://default:89y7UvzvBrRIV8llY3V0SzvChxvj5D6o@redis-15835.crce220.us-east-1-4.ec2.cloud.redislabs.com:15835",
//   {
//     maxRetriesPerRequest: null, // ✅ required for BullMQ
//   },
// );

// redisConnection.on("connect", () => {
//   console.log("✅ Connected to Redis Cloud");
// });

// redisConnection.on("error", (err) => {
//   console.log("❌ Redis Error:", err);
// });

// module.exports = { redisConnection };
