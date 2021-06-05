const Review = require('../Models/reviewModel');
const catchAsync = require('../Utilities/catchAsync');
const handleFactory = require('../Controller/handlerFactory');

exports.addReview = handleFactory.createOne(Review);
exports.getAllReview = handleFactory.getAll(Review);
exports.updateReview = handleFactory.updateOne(Review);
exports.deleteReview = handleFactory.deleteOne(Review);
exports.getReviewById = handleFactory.getOne(Review);
exports.updateReviewById = handleFactory.updateOne(Review);
exports.deleteReviewById = handleFactory.deleteOne(Review);
