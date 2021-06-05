const express = require('express');
const app = express();
const route = express.Router();

const userController = require('../Controller/userController');
const authController = require('../Controller/authController');

route.route('/signup').post(authController.userSignup);
route.route('/login').post(authController.userlogin);
route.route('/logout').get(authController.userLogout);
route.route('/forgortPassword').post(authController.passwordUpdate);
route.route('/resetPassword/:token').patch(authController.resetPassword);
route.use(authController.protect);

route
  .route('/getmyprofile')
  .get(userController.getMyprofile, userController.getUser);
route
  .route('/updateData')
  .patch(
    userController.uploadData,
    userController.userPhotoResize,
    userController.updateMe
  );
route.use(authController.restrictTo('admin', 'lead-admin'));
route.route('/').get(userController.getAllUsers).post(userController.addUser);
route
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser);

route.patch('/deleteUser', userController.deleteMe);
route.route('/updatePassword').patch(authController.updatePassword);

module.exports = route;
