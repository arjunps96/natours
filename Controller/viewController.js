const Tour = require('../Models/tourmodel');
const Booking = require('../Models/bookingModel');
const User = require('../Models/userModel');
const catchAsync = require('../Utilities/catchAsync');
const Apperror = require('../Utilities/Apperror');
exports.getOverview = catchAsync(async (req, res, next) => {
  //find alltours
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');
  if (!tour) {
    return next(new Apperror('No tour found', '400'));
  }
  res.status(200).render('tours', {
    title: tour.name,
    tour,
  });
});
exports.userLogin = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'User Login',
  });
});
exports.getAccount = (req, res) => {
  res.status(200).render('accounts', {
    title: 'My Account',
  });
};
exports.updateAccount = catchAsync(async (req, res) => {
  console.log(req.body);
  const updatedData = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('accounts', {
    title: 'You Account',
    user: updatedData,
  });
});

exports.userBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.find({ user: req.user.id });
  const bookingId = booking.map((el) => el.tour);

  const tours = await Tour.find({ _id: { $in: bookingId } });

  res.status(200).render('overview', {
    title: 'My tours',
    tours,
  });
});
