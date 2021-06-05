const express = require('express');
const app = express();
const route = express.Router();
const viewController = require('../Controller/viewController');
const authController = require('../Controller/authController');
const bookingController = require('../Controller/bookingController');

route.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
//route.get('/tour', viewController.getTour);
route.get('/tours/:id', authController.isLoggedIn, viewController.getTour);
route.get('/login', authController.isLoggedIn, viewController.userLogin);
route.get('/me', authController.protect, viewController.getAccount);
route.get('/my-tours', authController.protect, viewController.userBooking);
route.post(
  '/submit-form-data',
  authController.protect,
  viewController.updateAccount
);

module.exports = route;
