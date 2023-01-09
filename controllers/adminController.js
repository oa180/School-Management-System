const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const catchAsync = require('../utils/catchAsync');
const responseMessage = require('../utils/responseMessage');
const AppError = require('../utils/AppError');

exports.assignNewAdmin = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new AppError(`Wrong user ID!`, 400));
  if (user.role === 'admin')
    return next(new AppError(`This user is already an admin!`, 400));

  await Admin.create({
    userRef: req.params.id,
    ...req.body,
  });

  user.role = 'admin';
  await user.save();
  responseMessage(res, 'New Admin Created', 201, user);
});

exports.showAllAdmins = catchAsync(async (req, res) => {
  const admins = await Admin.find({}).populate('userRef', 'fullname');
  responseMessage(res, '', 201, admins);
});
