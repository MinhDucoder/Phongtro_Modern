import express from 'express';

const bookingRoute = express.Router();

bookingRoute.get('/booking', (req, res) => {
  res.send('Booking Route');
});

export default bookingRoute;
