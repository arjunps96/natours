const express = require('express');
const app = express();
const route = express.Router({ mergeParams: true });
const reviewController = require('../Controller/reviewController');
const authController = require('../Controller/authController');
const handleFactory = require('../Controller/handlerFactory');

route
  .get('/', authController.protect, reviewController.getAllReview)
  .post(
    '/',
    authController.protect,
    authController.restrictTo('user'),
    handleFactory.getTourbyId,
    reviewController.addReview
  );

module.exports = route;
