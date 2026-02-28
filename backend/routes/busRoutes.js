const express = require('express');
const router = express.Router();

let buses = [];

try {
  const rawData = require('../data/buses.json');
  buses = rawData;
  console.log("✅ Loaded buses.json with", buses.length, "entries");
} catch (err) {
  console.error("❌ Could not load buses.json:", err.message);
}

router.get('/', (req, res) => {
  console.log("➡️  API Call: /api/buses", req.query);

  const { source, destination, date } = req.query;

  if (!source || !destination || !date) {
    console.warn("⚠️ Missing query parameters");
    return res.status(400).json({ 
      message: "Missing query parameters",
      required: ["source", "destination", "date"]
    });
  }

  try {
    console.log(`Searching for buses from ${source} to ${destination}`);
    
    const results = buses.filter(bus => {
      try {
        const sourceMatch = Array.isArray(bus.source) 
          ? bus.source.some(src => src.toLowerCase() === source.toLowerCase())
          : bus.source.toLowerCase() === source.toLowerCase();
        
        const destMatch = Array.isArray(bus.destination)
          ? bus.destination.some(dest => dest.toLowerCase() === destination.toLowerCase())
          : bus.destination.toLowerCase() === destination.toLowerCase();

        return sourceMatch && destMatch;
      } catch (err) {
        console.error("Error processing bus entry:", err);
        return false;
      }
    });

    if (results.length === 0) {
      console.log(`ℹ️ No buses found for ${source} to ${destination}`);
      return res.json([]);
    }

    console.log(`✅ Found ${results.length} buses`);
    res.json(results);
  } catch (error) {
    console.error("❌ Error during filtering:", error);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: error.message,
      details: error.stack
    });
  }
});

module.exports = router;
