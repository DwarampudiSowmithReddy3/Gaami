const express = require('express');
const router = express.Router();
const places = require('../data/places.json');

router.get('/', (req, res) => {
  const { destination } = req.query;

  if (!destination) {
    return res.status(400).json({ message: "Missing destination parameter" });
  }

  // For now, return all places as they are all in Chennai
  res.json(places);
});

module.exports = router; 