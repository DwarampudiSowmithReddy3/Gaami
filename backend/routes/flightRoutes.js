const express = require('express');
const router = express.Router();
const flights = require('../data/flights.json');

router.get('/', (req, res) => {
  const { source, destination } = req.query;

  if (!source || !destination) {
    return res.status(400).json({ message: "Missing required query parameters" });
  }

  // Normalize city names
  const normalizedSource = source.toLowerCase().trim();
  const normalizedDestination = destination.toLowerCase().trim();

  // Filter flights based on source and destination
  let results = flights.filter(flight => {
    const flightSource = flight.source.toLowerCase();
    const flightDestination = flight.destination.toLowerCase();
    return flightSource === normalizedSource && flightDestination === normalizedDestination;
  });

  res.json(results);
});

module.exports = router;