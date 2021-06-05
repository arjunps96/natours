const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour should have a name'],
      unique: true,
      maxLength: [40, 'A tour name should be only 40 characters long'],
      minLength: [10, 'A tour name should be atleast 10 characters long'],
    },
    price: {
      type: Number,
      required: [true, 'A tour should have a price'],
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    duration: {
      type: Number,
      required: [true, 'A tour needs duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour needs duration'],
    },
    difficulty: {
      type: String,
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: Number,
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.index({ price: 1 }, { ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (el) => await User.findById(el));
//   this.guides = await Promise.all(guidePromises);
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
