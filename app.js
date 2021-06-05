//Requiremnets
const express = require('express');
const { Error } = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const tourRoute = require('./Router/tourRouter');
const userRoute = require('./Router/userRouter');
const reviewRoute = require('./Router/reviewRouter');
const AppError = require('./Utilities/Apperror');
const errorControllerHHandler = require('./Controller/ErrorController');
const cookieParser = require('cookie-parser');
const viewRouter = require('./Router/viewRouter');
const bookingRoute = require('./Router/bookingRouter');
//middleware
const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'you have crossed the maximum requets for this route',
});

app.use('/', viewRouter);
app.use('/api', limiter);

app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/bookings', bookingRoute);
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find path:${req.originalUrl}`,
  // });
  // const err = new Error(`Can't find path:${req.originalUrl}`);
  // err.statusCode = 404;
  // err.status = 'Arjun';
  const err = new AppError(`Can't find path:${req.originalUrl}`, '404');
  next(err);
});

app.use(errorControllerHHandler);
module.exports = app;
