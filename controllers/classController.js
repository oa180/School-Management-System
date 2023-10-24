const Class = require('../models/classModel');
const Teacher = require('../models/teacherModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const responseMessage = require('../utils/responseMessage');

exports.createNewClass = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.body.teacherInCharge);
  // const teacher = await Teacher.find({ userRef: user.id });

  if (user.role !== 'teacher')
    return next(new AppError('There is no teacher with that id!', 400));

  const { students } = req.body;
  // let users = [];
  let users = students.map(async s => {
    const u = await User.findById(s);
    if (u && u.role == 'student') return u;
  });

  users = await Promise.all(users);
  users = users.filter(u => u != undefined);

  // console.log(users);
  req.body.students = users;

  const newClass = new Class(req.body);
  newClass.classSequence = `${newClass.className}/${newClass.classNumber}`;
  await newClass.save({ validateBeforeSave: true });

  responseMessage(res, 'New Class Created', 201, newClass);
});

exports.showAllClasses = catchAsync(async (req, res) => {
  const classes = await Class.find({}).select(
    'classSequence teacherInCharge numberOfStudents capacity'
  );
  responseMessage(res, '', 201, classes);
});

exports.showClass = catchAsync(async (req, res) => {
  const id = req.params.cid;
  const classRes = await Class.findById(id, 'students').populate({
    path: 'students',
    // select: 'students',
  });

  responseMessage(res, '', 201, classRes);
});
