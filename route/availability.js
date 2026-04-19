const express = require("express");
const router = express.Router();

const {
  checkAvailability,
  checkAvailabilityById,
} = require("../controller/availability");

router.post("/check-availability", checkAvailability);
router.post("/check-availability/:roomId", checkAvailabilityById);
module.exports = router;
