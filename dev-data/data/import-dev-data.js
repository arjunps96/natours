const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../../Models/tourmodel');
const User = require('../../Models/userModel');
const Review = require('../../Models/reviewModel');

const DB =
  'mongodb+srv://arjunps:eLUwfwLvzFTWT8UB@cluster0.6psjt.mongodb.net/natours?retryWrites=true&w=majority';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection is successfull');
  });

const importData = async () => {
  try {
    // const tours = JSON.parse(
    //   fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
    // );
    const users = JSON.parse(
      fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
    );
    // const reviews = JSON.parse(
    //   fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
    // );
    //await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    // await Review.create(reviews);
    console.log('Data succesfully added to DB');
  } catch (err) {
    console.log(err.message);
  }
};
const removeData = async () => {
  try {
    //await Tour.deleteMany();
    await User.deleteMany();
    // await Review.deleteMany();
    console.log('Data succesfully removed');
  } catch (err) {
    console.log(err.message);
  }
};
if (process.argv[2] === '--delete') {
  removeData();
} else if (process.argv[2] === '--create') {
  importData();
}
