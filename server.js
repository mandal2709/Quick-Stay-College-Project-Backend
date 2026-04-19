const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./util/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { startScheduler } = require("./bull/scheduler");

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL || "",
].filter(Boolean); // Remove empty strings

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

      return callback(null, true); // 🔥 TEMP: allow all (for debugging)
      // return callback(new Error("CORS not allowed"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ✅ add OPTIONS
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Quick Stay Hotel Booking API", status: "running" });
});

app.use("/api/auth", require("./route/auth"));
app.use("/api/rooms", require("./route/rooms"));
app.use("/api/bookings", require("./route/booking"));
app.use("/api/admin", require("./route/admin"));
app.use("/api/availability", require("./route/availability"));

const startServer = async () => {
  await connectDB();
  // await startScheduler();

  app.listen(5000, () => console.log("Server running on port 5000"));
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
