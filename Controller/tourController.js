const fs = require('fs');
const Tour = require('../Models/tourmodel');
const AppError = require('../Utilities/Apperror');
const catchAsync = require('../Utilities/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const handleFactory = require('../Controller/handlerFactory');

exports.getAllTours = handleFactory.getAll(Tour);
exports.addTour = handleFactory.createOne(Tour);
exports.getTour = handleFactory.getOne(Tour, 'reviews');
exports.updateTours = handleFactory.updateOne(Tour);
exports.deleteTour = handleFactory.deleteOne(Tour);

exports.addMiddleware = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,duration,difficulty,summary,ratingsAverage,price';

  next();
};
const storage = multer.memoryStorage();
// exports.userPhotoResize = (req, res, next) => {
//   if (!req.file) return next();
//   req.file.filename = `user--${req.user.id}--${Date.now()}.jpeg`;
//   sharp(req.file.buffer)
//     .resize(500, 500)
//     .toFormat('jpeg')
//     .toFile(`public/img/users/${req.file.filename}`);
//   next();
// };
const filter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Apperror('The upload should be a image', '400'), false);
  }
};
const upload = multer({ storage, fileFilter: filter });
exports.uploadTourData = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  {
    name: 'images',
    maxCount: 3,
  },
]);
exports.tourResize = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  //Image Cover
  req.body.imageCover = `tour--${req.params.id}--${Date.now()}.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour--${req.params.id}--${Date.now()}--${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
});
exports.toursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378;
  if (!lat || !lng) {
    next(
      new AppError('The latitude and longitude should be in format lat,lng')
    );
  }
  const tour = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });
  res.status(200).json({
    status: 'success',
    results: tour.length,
    data: {
      tour,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError('The latitude and longitude should be in format lat,lng')
    );
  }
  const tour = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMutliplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: tour.length,
    data: {
      tour,
    },
  });
});
// const tour = tours.find((el) => el.id === id);
// if (!tour) {
//   res.status(404).json({
//     status: 'fail',
//     message: 'inavlid ID',
//   });
// }
// res.status(200).json({
//   status: 'success',
//   requestDate: req.requestTime,
//   data: {
//     tour,
//   },
// });

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([{ $unwind: '$startDates' }]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
