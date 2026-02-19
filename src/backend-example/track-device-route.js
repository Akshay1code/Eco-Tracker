// Example Express.js route for /api/track-device
// This file is for reference only — not used by the frontend.

const express = require("express");
const router = express.Router();

router.post("/api/track-device", (req, res) => {
  const { email, carbon, batteryUsed, distance, speed, location } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  console.log(`[EcoTracker] ${email}:`, {
    carbon: `${carbon} kg CO2`,
    batteryUsed: `${batteryUsed}%`,
    distance: `${distance} km`,
    speed: `${speed} km/h`,
    location,
    timestamp: new Date().toISOString(),
  });

  // TODO: Save to database (MongoDB, PostgreSQL, etc.)

  res.json({ success: true, message: "Tracking data received" });
});

module.exports = router;
