const express = require('express');
const app = express();
const route = express.Router();
const bookingController = require('../Controller/bookingController');
const authController = require('../Controller/authController');

route.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getSession
);
module.exports = route;
