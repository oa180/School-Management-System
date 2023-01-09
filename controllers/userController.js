const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const responseMessage = require('../utils/responseMessage');
const logger = require('../utils/logging');

const signToken = id => {
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createResponse = (user, res, statusCode) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // if (process.env.NODE_ENV === 'production')
  cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    user: {
      fullname: user.fullname,
      email: user.email,
    },
    token,
  });
};
exports.createNewUser = catchAsync(async (req, res, next) => {
  // create new user
  const newUser = await User.create(req.body);
  responseMessage(res, 'New User Created', 201, newUser);
});
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  const { fullname, email, phone, address } = req.body;

  user.fullname = fullname;
  user.email = email;
  user.phone = phone;
  user.address = address;
  await user.save();

  res.send(user);
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  responseMessage(res, 'User deleted', 204);
});

exports.showAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({}, '-password -__v');

  logger.info('Attend', { user: users[0].fullname });

  if (process.env.NODE_ENV === 'development') {
    return responseMessage(res, '', 200, users);
  }

  res.render('allUsers', {
    pageTitle: 'All Users',
    users,
    hasBooks: users.length,
  });
});

exports.showSingleUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id, '-password -__v');
  if (!user) return next(new AppError('No user with that ID!', 404));

  responseMessage(res, '', 200, user);

  // res.render('single', {
  //   pageTitle: 'single page',
  //   result: user,
  // });
});

const filterBody = (obj, ...filter) => {
  const filterdObj = {};
  Object.keys(obj).forEach(el => {
    if (filter.includes(el)) filterdObj[el] = obj[el];
  });

  return filterdObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route isnot fot password updae, use http://127.0.0.1:3000/user/updatepassword',
        400
      )
    );

  const filteredObj = filterBody(
    req.body,
    'fullname',
    'email',
    'phone',
    'address'
  );
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
  });

  responseMessage(res, 'User Updated', 200, updatedUser);
});
exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!(await user.correctPassword(req.body.currentPassword)))
    return next(new AppError('The Cuurent password is incorrect', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  createResponse(user, res, 200);
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  user.status = false;
  await user.save();
  responseMessage(res, '', 204);
});
