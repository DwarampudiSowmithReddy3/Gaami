const express = require('express');
const cors = require('cors');
const app = express();

const trainRoutes = require('./routes/trainRoutes');
const busRoutes = require('./routes/busRoutes');
const flightRoutes = require('./routes/flightRoutes');
const placeRoutes = require('./routes/placeRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const foodRoutes = require('./routes/foodRoutes');

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/trains', trainRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/food', foodRoutes);

app.get('/', (req, res) => {
  res.send('🚉 Train API | 🚌 Bus API | ✈ Flight API | 🏛️ Places API | 🏨 Hotels API | 🍽️ Food API are running!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
