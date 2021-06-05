const express = require('express');
const app = express();
const route = express.Router();
const tourController = require('../Controller/tourController');
const authController = require('../Controller/authController');
const reviewController = require('../Controller/reviewController');
const reviewRouter = require('./reviewRouter');
const Tour = require('../Models/tourmodel');

route.use('/:tourId/reviews', reviewRouter);
route.route('/').get(tourController.getAllTours).post(tourController.addTour);
route
  .route('/top-5-tours')
  .get(tourController.addMiddleware, tourController.getAllTours);
route.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
route
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.toursWithin);
route
  .route('/distancefromPoint/center/:latlng/unit/:unit')
  .get(tourController.getDistance);
route.use(authController.protect);
route
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    tourController.uploadTourData,
    tourController.tourResize,
    tourController.updateTours
  )
  .delete(tourController.deleteTour);
// route
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.addReview
//   );
module.exports = route;
