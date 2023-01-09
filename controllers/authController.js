const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logging');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
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

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

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
exports.signup = catchAsync(async (req, res, next) => {
  // create new user
  const newUser = await User.create({
    fullname: req.body.fullname,
    email: req.body.email,
    phone: req.body.phone,
    dob: req.body.dob,
    gender: req.body.gender,
    address: req.body.address,
    bloodType: req.body.bloodType,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  // create token
  createResponse(newUser, res, 201);
});

exports.renderLogin = (req, res, next) => {
  res.render('login');
};
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //   check if user provises email and password
  if (!email || !password)
    return next(new AppError('Please provide email and password!', 400));

  // check if email & password are correct
  // check if user was exists and deactivated
  const existingUser = await User.findOne({
    email: req.body.email,
    status: false,
  });

  // console.log(existingUser);
  if (existingUser) {
    existingUser.status = true;
    await existingUser.save();
    createResponse(existingUser, res, 201);
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Wrong email or password!', 401));
  }

  if (process.env.NODE_ENV === 'development') {
    return createResponse(user, res, 200);
  }

  res.render('single', {
    pageTitle: 'single page',
    result: user,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // Get jwt from header

  let token;
  if (process.env.NODE_ENV === 'development') {
    if (!req.headers.authorization)
      return next(
        new AppError(`You aren't looged in, please login and try again!`, 401)
      );

    token = req.headers.authorization.split(' ').pop();
    // console.log(token);
  }

  // Get jwt from cookie
  if (process.env.NODE_ENV === 'production') {
    if (!req.cookies.jwt)
      return next(
        new AppError(`You aren't looged in, please login and try again!`, 401)
      );
    token = req.cookies.jwt;
    // console.log(token);
  }

  if (token === 'null')
    return next(
      new AppError(`You aren't looged in, please login and try again!`, 401)
    );
  // verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(`The user belonging to this token is no longer exists!`, 401)
    );

  if (currentUser.passwordChangedAfter(decoded.iat))
    return next(
      new AppError(
        `Password changed after token is created, please login again!`,
        401
      )
    );

  req.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.error('Not Authorized');
      return next(
        new AppError(`You don't have access to perform this action!`, 401)
      );
    }
    next();
  };
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired!', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetPasswordToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // login user
  createResponse(user, res, 200);
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1) get user via posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError(`Cann't find a user with that email!`, 400));

  // 2) create a random token
  const resetToken = user.createPasswordResetToken();
  await user.save();

  // 3) send the token via email
  res.status(200).json({
    status: 'success',
    message: `Forget your password? If you willing to reset it please click on this link \n http://127.0.0.1:3000/api/v1/auth/resetpassword/${resetToken} \n If you aren't willing to change it please kindly ignore this message. \nthanks`,
  });
});
