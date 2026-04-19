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
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
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
