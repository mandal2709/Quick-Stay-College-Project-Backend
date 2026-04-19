const mongoose = require("mongoose");
const { create } = require("./Bookings");

const roomSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  roomType: {
    type: String,
    enum: ["single", "double", "suite", "luxury"],
    default: "single",
  },
  price: {
    type: Number,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amenities: {
    wifi: { type: Boolean, default: false },
    breakfast: { type: Boolean, default: false },
    roomService: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
  },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// Create compound unique index (owner + title must be unique)
roomSchema.index({ owner: 1, title: 1 }, { unique: true });

module.exports = mongoose.model("Room", roomSchema);
