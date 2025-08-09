const express = require('express');
const router = express.Router();
const restaurants = require('../data/food.json');

router.get('/', (req, res) => {
  const { destination } = req.query;

  if (!destination) {
    return res.status(400).json({ message: "Missing destination parameter" });
  }

  // Filter restaurants based on location
  const filteredRestaurants = restaurants.filter(restaurant => 
    restaurant.location.toLowerCase() === destination.toLowerCase()
  );

  if (filteredRestaurants.length === 0) {
    return res.status(404).json({ message: "No restaurants found for this location" });
  }

  res.json(filteredRestaurants);
});

module.exports = router; 