class Apperror extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statuscode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.IsOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = Apperror;
