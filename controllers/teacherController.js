const Teacher = require('../models/teacherModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const responseMessage = require('../utils/responseMessage');

exports.createNewTeacher = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError(`Wrong user ID!`, 400));

  await Teacher.create({
    userRef: req.params.id,
    ...req.body,
  });

  user.role = 'teacher';
  await user.save();
  responseMessage(res, 'New Teacher Created', 201, user);
});

exports.showAllTeacheres = catchAsync(async (req, res) => {
  const teachers = await Teacher.find({});
  responseMessage(res, '', 200, teachers);
});
