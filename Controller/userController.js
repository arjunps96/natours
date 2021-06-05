const catchAsync = require('../Utilities/catchAsync');
const User = require('../Models/userModel');
const Apperror = require('../Utilities/Apperror');
const multer = require('multer');
const sharp = require('sharp');
const handleFactory = require('../Controller/handlerFactory');

const requestFilterData = (elements, ...filterobject) => {
  const filterBody = {};
  Object.keys(elements).forEach((el) => {
    if (filterobject.includes(el)) filterBody[el] = elements[el];
  });
  return filterBody;
};
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user--${req.user.id}--${Date.now()}.${ext}`);
//   },
// });
const storage = multer.memoryStorage();
exports.userPhotoResize = async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user--${req.user.id}--${Date.now()}.jpeg`;
  req.body.photo = `user--${req.user.id}--${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};
const filter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Apperror('The upload should be a image', '400'), false);
  }
};
const upload = multer({ storage, fileFilter: filter });
exports.uploadData = upload.single('photo');
exports.getMyprofile = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getAllUsers = handleFactory.getAll(User);
exports.addUser = (req, res) => {
  res.status(500).json({
    status: 'Internal server error',
    message: 'Please use signup instead',
  });
};
exports.getUser = handleFactory.getOne(User);
exports.deleteUser = handleFactory.deleteOne(User);
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.Password || req.body.confirmPassword) {
    return next(
      new Apperror('This route will not handle password change route', '404')
    );
  }
  const filterBody = requestFilterData(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;

  const currentUser = await User.findByIdAndUpdate(req.user._id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: currentUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
