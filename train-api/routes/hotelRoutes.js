const express = require('express');
const router = express.Router();
const hotels = require('../data/hotels.json');

router.get('/', (req, res) => {
  const { destination } = req.query;

  if (!destination) {
    return res.status(400).json({ message: "Missing destination parameter" });
  }

  // Filter hotels based on location
  const filteredHotels = hotels.filter(hotel => 
    hotel.location.toLowerCase().includes(destination.toLowerCase())
  );

  if (filteredHotels.length === 0) {
    return res.status(404).json({ message: "No hotels found for this location" });
  }

  res.json(filteredHotels);
});

module.exports = router; 