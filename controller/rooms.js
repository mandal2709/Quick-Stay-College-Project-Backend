const User = require("../model/User");
const Room = require("../model/Room");
const upload = require("../middleware/multer");
const cloudinary = require("../util/cloudinary");

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    const roomsWithOwners = await Promise.all(
      rooms.map(async (room) => {
        const owner = await User.findById(room.owner);
        return { ...room._doc, owner };
      }),
    );
    res.json(roomsWithOwners);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    const owner = await User.findById(room.owner);
    const roomData = room.toObject();
    roomData.owner = owner;
    res.json(roomData);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const addReview = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "User not authenticated. Please log in first." });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res
        .status(400)
        .json({ message: "Rating and comment are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newReview = {
      user: user._id,
      name: user.fullName || user.email || "Anonymous",
      rating: Number(rating),
      comment,
    };

    room.reviews = room.reviews || [];
    room.reviews.push(newReview);
    await room.save();

    res.status(201).json({ message: "Review added", review: newReview });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const get5StarReviews = async (req, res) => {
  try {
    const rooms = await Room.find();
    const fiveStarReviews = [];
    rooms.forEach((room) => {
      const filteredReviews = (room.reviews || []).filter(
        (review) => review.rating === 5,
      );
      fiveStarReviews.push(...filteredReviews);
    });
    res.json({ reviews: fiveStarReviews });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const createRoom = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "User not authenticated. Please log in first." });
    }

    const userId = req.user.id;

    // Destructure form data
    const {
      title,
      roomType,
      location,
      mobileNo,
      pricePerNight,
      description,
      amenities,
    } = req.body;

    // Validate required fields
    if (!title || !location || !mobileNo || !pricePerNight || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Parse amenities if it's a string (from form data)
    let parsedAmenities = amenities;
    if (typeof amenities === "string") {
      try {
        parsedAmenities = JSON.parse(amenities);
      } catch (error) {
        parsedAmenities = {};
      }
    }

    // Handle image uploads to Cloudinary
    const imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "hotel-rooms",
                resource_type: "auto",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              },
            );
            stream.end(file.buffer);
          });

          imageUrls.push(result.secure_url);
        } catch (uploadError) {
          return res.status(500).json({
            message: "Error uploading image to Cloudinary",
            error: uploadError.message,
          });
        }
      }
    }

    if (imageUrls.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    // Create room object
    const newRoom = new Room({
      owner: userId,
      title,
      approvalStatus: "pending",
      roomType: roomType || "single",
      location,
      contact: mobileNo,
      price: parseFloat(pricePerNight),
      images: imageUrls,
      description,
      amenities: {
        wifi: parsedAmenities["free Wi-Fi"] || false,
        breakfast: parsedAmenities["free Brekfast"] || false,
        roomService: parsedAmenities["Room Service"] || false,
        airConditioning: parsedAmenities["Mountain View"] || false,
        parking: parsedAmenities["Pool Access"] || false,
      },
    });

    // Save room to database
    await newRoom.save();

    res.status(201).json({
      message: "Room created successfully",
      room: newRoom,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({
      message: "Server error while creating room",
      error: error.message,
    });
  }
};

const getRoomsByOwner = async (req, res) => {
  try {
    console.log("Fetching rooms for user:", req.user); // Debugging log
    // Check if user is logged in
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "User not authenticated. Please log in first." });
    }

    const rooms = await Room.find({ owner: req.user.id });
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms by owner:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching rooms by owner" });
  }
};

const updateRoom = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "User not authenticated. Please log in first." });
    }

    const roomId = req.params.id;
    const userId = req.user.id;

    // Find the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if user owns this room
    if (room.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this room" });
    }

    // Destructure form data
    const {
      title,
      roomType,
      location,
      mobileNo,
      pricePerNight,
      description,
      amenities,
    } = req.body;

    // Validate required fields
    if (!title || !location || !mobileNo || !pricePerNight || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Parse amenities if it's a string
    let parsedAmenities = amenities;
    if (typeof amenities === "string") {
      try {
        parsedAmenities = JSON.parse(amenities);
      } catch (error) {
        parsedAmenities = {};
      }
    }

    // Handle new image uploads to Cloudinary
    let imageUrls = [];

    // Use existingImages if provided, otherwise keep current images
    if (req.body.existingImages) {
      try {
        imageUrls = JSON.parse(req.body.existingImages);
      } catch (error) {
        imageUrls = room.images || [];
      }
    } else {
      imageUrls = room.images || [];
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "hotel-rooms",
                resource_type: "auto",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              },
            );
            stream.end(file.buffer);
          });

          imageUrls.push(result.secure_url);
        } catch (uploadError) {
          return res.status(500).json({
            message: "Error uploading image to Cloudinary",
            error: uploadError.message,
          });
        }
      }
    }

    // Ensure at least one image exists
    if (imageUrls.length === 0) {
      return res.status(400).json({
        message: "Room must have at least one image",
      });
    }

    // Update room
    room.title = title;
    room.roomType = roomType || room.roomType;
    room.location = location;
    room.contact = mobileNo;
    room.price = parseFloat(pricePerNight);
    room.description = description;
    room.images = imageUrls;
    room.amenities = {
      wifi: parsedAmenities["free Wi-Fi"] || false,
      breakfast: parsedAmenities["free Brekfast"] || false,
      roomService: parsedAmenities["Room Service"] || false,
      airConditioning: parsedAmenities["Mountain View"] || false,
      parking: parsedAmenities["Pool Access"] || false,
    };

    await room.save();

    res.status(200).json({
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({
      message: "Server error while updating room",
      error: error.message,
    });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  addReview,
  createRoom,
  getRoomsByOwner,
  updateRoom,
  get5StarReviews,
};
