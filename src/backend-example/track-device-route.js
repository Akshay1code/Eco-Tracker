// Example Express.js route for /api/track-device
// This file is for reference only — not used by the frontend.

const express = require("express");
const router = express.Router();

router.post("/api/track-device", (req, res) => {
  const {
    email,
    carbon,
    batteryUsed,
    distance,
    gpsDistance,
    estimatedDistance,
    speed,
    steps,
    cadence,
    activity,
    caloriesBurned,
    co2SavedKg,
    lastStepConfidence,
    averageStepConfidence,
    debugSignals,
    location,
  } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const summary = {
    carbon: `${carbon ?? 0} kg CO2`,
    batteryUsed: `${batteryUsed ?? 0}%`,
    distance: `${distance ?? 0} km`,
    gpsDistance: `${gpsDistance ?? 0} km`,
    estimatedDistance: `${estimatedDistance ?? 0} km`,
    speed: `${speed ?? 0} km/h`,
    steps: Number(steps ?? 0),
    cadence: `${cadence ?? 0} spm`,
    activity: activity || "idle",
    caloriesBurned: `${caloriesBurned ?? 0} kcal`,
    co2SavedKg: `${co2SavedKg ?? 0} kg CO2`,
    lastStepConfidence: Number(lastStepConfidence ?? 0),
    averageStepConfidence: Number(averageStepConfidence ?? 0),
    debugSamples: Array.isArray(debugSignals) ? debugSignals.length : 0,
    location,
    timestamp: new Date().toISOString(),
  };

  console.log(`[EcoTracker] ${email}:`, {
    ...summary,
  });

  // TODO: Save to database (MongoDB, PostgreSQL, etc.)

  res.json({
    success: true,
    message: "Tracking data received",
    pedometer: summary,
  });
});

module.exports = router;
