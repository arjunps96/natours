const { listenerCount } = require('../Models/tourmodel');
const Apperror = require('../Utilities/Apperror');

const devError = (req, res, err, next) => {
  return res.status(404).render('error', {
    type: 'error',
    message: 'Something went wrong',
  });
};

module.exports = (err, req, res, next) => {
  let errStatusCode = err.statuscode || 500;
  let errStatus = err.status || 'error';

  if (err.name === 'CastError') {
    const error = CastNewError(err);
    return res.status(error.statuscode).json({
      status: error.status,
      message: error.message,
    });
  }
  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const errormeesage = `Duplicate value:${value}.Please enter a new value`;
    return res.status(400).json({
      status: 'fail',
      message: errormeesage,
    });
  }
  if (err.name === 'JsonWebTokenError') {
    const errormeesage = 'Inavlid token..Please login again';
    return res.status(400).json({
      status: 'fail',
      message: errormeesage,
    });
  }
  if (err.name === 'TokenExpiredError') {
    const errormeesage =
      'Token Expires....Please login again for the new token';
    return res.status(400).json({
      status: 'fail',
      message: errormeesage,
    });
  }

  return res.status(errStatusCode).json({
    status: errStatus,
    message: err.message,
  });
};
const CastNewError = (err) => {
  const statusCode = '404';
  const message = `Inavlid ${err.path}:${err.value}`;
  return new Apperror(message, statusCode);
};
