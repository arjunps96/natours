const catchAsync = require('../Utilities/catchAsync');
const { promisify } = require('util');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../Models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Apperror = require('../Utilities/Apperror');
const Email = require('../Utilities/Email');

const sendResponse = (user, statusCode, res) => {
  const token = tokenGenerate(user._id);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  });
  user.Password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
const tokenGenerate = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
exports.userSignup = catchAsync(async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    Password: req.body.Password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();
  sendResponse(user, 201, res);
});

exports.userlogin = catchAsync(async (req, res, next) => {
  const { email, Password } = req.body;

  if (!email || !Password) {
    return next(new Apperror('Please provide a email & Password', '400'));
  }

  const user = await User.findOne({ email }).select('+Password');
  if (!user || !(await user.correctPassword(Password, user.Password))) {
    return next(new Apperror('Please provide correct email & Password', '401'));
  }
  sendResponse(user, 200, res);
});

exports.userLogout = (req, res) => {
  res.cookie('jwt', 'Logout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new Apperror('You are not logged in! Please log in to get access', '404')
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //If user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new Apperror(
        'The user with this token is not existing..please signupagain',
        '401'
      )
    );
  }
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new Apperror(
        'Your password was chnaged after the token was issued..Please create a new Token',
        '401'
      )
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //If user still exist
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      if (currentUser.passwordChangedAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Apperror('You dont have the permission to delete this user', '403')
      );
    }
    next();
  };
};
exports.passwordUpdate = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new Apperror('No user found for this email', '404'));
  }
  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  const restUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user, restUrl).passwordReset();
  } catch (err) {
    console.log(err.message);
    (this.PasswordResetToken = undefined),
      (this.PasswordResetExpires = undefined),
      await user.save({ validateBeforeSave: false });
    return next(new Apperror('Something went wrong..Please try again', '500'));
  }
  res.status(200).json({
    status: 'success',
    message: 'Token send to email.',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)Get User based on passwordKey
  const hasToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    PasswordResetToken: hasToken,
    PasswordResetExpires: { $gt: Date.now() + 1000 },
  });
  //console.log(user.email);

  //2)Check whether the user Exists or token expires
  if (!user) {
    return next(new Apperror('Token is invalid or Expired'));
  }
  user.Password = req.body.Password;
  user.confirmPassword = req.body.confirmPassword;
  user.PasswordResetToken = undefined;
  user.PasswordResetExpires = undefined;

  //update the password
  //4)save
  await user.save();
  sendResponse(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user._id).select('+Password');

  if (
    !(await currentUser.correctPassword(
      req.body.PasswordCurrent,
      currentUser.Password
    ))
  ) {
    return next(new Apperror('You current Password is wrong', '401'));
  }
  currentUser.Password = req.body.newPassword;
  currentUser.confirmPassword = req.body.newPasswordConfirm;

  await currentUser.save();
  sendResponse(currentUser, 200, res);
});
