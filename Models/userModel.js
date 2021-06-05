const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must provide a username'],
  },
  email: {
    type: String,
    required: true,
    required: [true, 'A user must have an email'],
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  Password: {
    type: String,
    required: true,
    minLength: 8,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  confirmPassword: {
    type: String,
    required: true,
    validate: {
      validator: function (el) {
        return el === this.Password;
      },
      message: 'Password should be same has above',
    },
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  passwordChangedAt: Date,
  PasswordResetToken: {
    type: String,
  },
  PasswordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('Password')) return next();
  this.Password = await bcrypt.hash(this.Password, 12);
  this.confirmPassword = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('Password') || !this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = async (userPassword, Password) => {
  return await bcrypt.compare(userPassword, Password);
};
userSchema.methods.passwordChangedAfter = function (JWTimestamp) {
  if (this.passwordChangedAt) {
    const passWordChangedTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return passWordChangedTime > JWTimestamp;
  }
  return false;
};

userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.PasswordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //console.log({ resetToken }, this.PasswordResetToken);
  this.PasswordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
