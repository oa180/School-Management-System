const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const schema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'A user must have a name!'],
    },
    email: {
      type: String,
      required: [true, 'A teacher must have an email!'],
      unique: true,
      validate: [validator.isEmail, 'Please enter a valid email!'],
      lowercase: true,
    },
    phone: {
      type: String,
      unique: true,
      required: [true, 'A teacher must have a phone number!'],
      min: [11, 'Please provide a valid phone number!'],
      max: [11, 'Please provide a valid phone number!'],
    },
    dob: {
      type: Date,
      required: [true, 'A teacher must have a date of birth!'],
      validate: [validator.isDate, 'Please provide a valid date!'],
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female'],
        message: "Gender must me 'male' or 'female'!",
      },
      required: [true, 'A teacher must have a gender!'],
    },
    address: {
      type: String,
      required: [true, 'A teacher must have an address!'],
    },
    bloodType: {
      type: String,
      required: [true, 'A user must have a blood type!'],
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: `Blood tupe must be ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']`,
      },
    },
    password: {
      type: String,
      reuired: [true, 'Please enter a password!'],
      minLength: [8, 'password must be greater than 8 letters!'],
    },
    passwordConfirm: {
      type: String,
      reuired: [true, 'Please enter a password confirm!'],
      minLength: [8, 'password must be greater than 8 letters!'],
      validate: {
        validator: function (el) {
          return this.password === el;
        },
        message: 'Password and password confirm must be identicals!',
      },
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'teacher', 'student', 'worker'],
        message: 'Wrong role value!',
      },
    },
    status: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: Date,
    resetPasswordToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

schema.pre('save', async function (next) {
  // passwoord encryption
  if (!this.isModified('password')) next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

schema.pre('save', function (next) {
  // set last password changing time
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

schema.pre(/^find/, function (next) {
  // handle deactive users
  if (this._conditions.email && this._conditions.status === false) {
    return next();
  }

  this.find({ status: { $ne: false } });

  next();
});

schema.methods.correctPassword = async function (providedPassword) {
  // check similarity of provided password and pointed document password
  return await bcrypt.compare(providedPassword, this.password);
};

schema.methods.passwordChangedAfter = function (tokenTimeStamp) {
  // check if password changed after token has been created
  if (!this.passwordChangedAt) return false;

  const changedTimeStamp = this.passwordChangedAt.getTime() / 1000;
  return changedTimeStamp < tokenTimeStamp;
};

schema.methods.createPasswordResetToken = function () {
  // create a reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
module.exports = mongoose.model('User', schema);
