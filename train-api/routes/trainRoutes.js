const express = require('express');
const router = express.Router();
const trains = require('../data/trains.json');

// Function to generate reverse route data
function generateReverseRoute(train) {
  return {
    ...train,
    trainNumber: `${train.trainNumber}-R`, // Add -R suffix to indicate reverse route
    source: train.destination,
    destination: train.source,
    // Keep other properties same as they represent the same service
    name: train.name,
    type: train.type,
    price: train.price
  };
}

router.get('/', (req, res) => {
  const { source, destination } = req.query;

  if (!source || !destination) {
    return res.status(400).json({ message: "Missing required query parameters" });
  }

  // Normalize city names
  const normalizedSource = source.toLowerCase().trim();
  const normalizedDestination = destination.toLowerCase().trim();

  // Get all trains including their reverse routes
  const allTrains = trains.reduce((acc, train) => {
    // Add original route
    acc.push(train);
    // Add reverse route
    acc.push(generateReverseRoute(train));
    return acc;
  }, []);

  // Filter trains based on source and destination
  const results = allTrains.filter(train => {
    const trainSource = train.source.toLowerCase();
    const trainDestination = train.destination.toLowerCase();
    
    return trainSource === normalizedSource && trainDestination === normalizedDestination;
  });

  res.json(results);
});

module.exports = router;
