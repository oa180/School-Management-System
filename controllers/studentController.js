const Student = require('../models/studentModel');
const User = require('../models/userModel');
const Subject = require('../models/subjectModel');
const catchAsync = require('../utils/catchAsync');
const responseMessage = require('../utils/responseMessage');
const AppError = require('../utils/appError');

exports.createNewStudent = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError(`Wrong user ID!`, 400));

  const newStudent = await Student.create({
    userRef: req.params.id,
    ...req.body,
  });

  user.role = 'student';
  await user.save();
  responseMessage(res, 'New Student Created', 201, user);
});

exports.showAllStudents = catchAsync(async (req, res) => {
  if (req.user) console.log(req.user);
  const students = await Student.find({}, 'userRef currentLevel subjects ')
    .populate({ path: 'userRef', select: 'fullname' })
    .populate({ path: 'subjects', select: 'subjectName' });

  responseMessage(res, '', 200, students);
});

exports.enroll = catchAsync(async (req, res, next) => {
  const student = await Student.findOne({ userRef: req.user.id });
  if (!student)
    return next(new AppError('Can not find user with that ID!', 404));

  console.log(student);
  const subject = await Subject.findById(req.params.subjectId);
  if (!subject)
    return next(new AppError('Can not find subject with that ID!', 404));

  student.subjects.push(req.params.subjectId);
  subject.students.push(student.id);
  await student.save();
  await subject.save();

  responseMessage(res, '', 200, student);
});
