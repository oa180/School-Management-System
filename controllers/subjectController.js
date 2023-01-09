const Subject = require('../models/subjectModel');
const Teacher = require('../models/teacherModel');
const Division = require('../models/divisionModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const responseMessage = require('../utils/responseMessage');

exports.createNewSubject = catchAsync(async (req, res, next) => {
  const teacher = await Teacher.findById(req.body.teacher);
  if (!teacher) return next(new AppError('Wrong Teacher ID!', 404));

  const division = await Division.findById(req.body.division);
  if (!division) return next(new AppError('Wrong Division ID!', 404));

  const newSubject = await Subject.create({
    subjectCode: req.body.subjectCode,
    subjectName: req.body.subjectName,
    division: req.body.division,
    bookName: req.body.bookName,
    grade: req.body.grade,
    teacher: req.body.teacher,
  });

  division.subjects.push(newSubject.id);
  await division.save();

  responseMessage(res, 'New Subject Created', 201, newSubject);
});

exports.showAllSubjects = catchAsync(async (req, res) => {
  const subjects = await Subject.find({})
    .populate({ path: 'division', select: 'divisionCode' })
    .populate({ path: 'teacher', select: 'userRef' });

  responseMessage(res, '', 201, subjects);
});
