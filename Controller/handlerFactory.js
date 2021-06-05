const catchAsync = require('../Utilities/catchAsync');
const Apperror = require('../Utilities/Apperror');
const APIfeautres = require('../Utilities/APIfeautres');
const { Model } = require('mongoose');
exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new Apperror('No docs found for this ID', '404'));
    }
    res.status(204).json({
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new Apperror('No docs found for this ID', '404'));
    }
    res.status(200).json({
      status: 'message',
      data: doc,
    });
  });
exports.getTourbyId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);
    if (!doc) {
      return next(new Apperror('No docs found for this ID', '404'));
    }
    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });
exports.getOne = (model, popOption) =>
  catchAsync(async (req, res) => {
    let query = model.findById(req.params.id);
    if (popOption) query = query.populate(popOption);
    const doc = await query;
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
exports.getAll = (model) =>
  catchAsync(async (req, res, next) => {
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((el) => delete queryObjects[el]);

    // let query = JSON.stringify(queryObjects);

    // //1A)filtering using GTE,GT,LT,LTE
    // query = query.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // let querStr = Tour.find(JSON.parse(query));
    //SOrt
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');

    //   querStr = querStr.sort(sortBy);
    // }
    //Select
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   querStr.select(fields);
    // }
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // querStr = querStr.skip(skip).limit(limit);
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const feautres = new APIfeautres(model.find(), req.query)
      .filter()
      .sort()
      .select()
      .paginate();

    const doc = await feautres.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      },
    });
  });
