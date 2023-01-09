/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const multer = require('multer');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const responseMessage = require('../utils/responseMessage');
const Exam = require('../models/examModel');
const Class = require('../models/classModel');
const Student = require('../models/studentModel');
const ExamRecord = require('../models/examRecordModel');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/files/examPapers');
  },
  filename: (req, file, cb) => {
    let ext = file.mimetype.split('/').pop();
    if (ext === 'vnd.openxmlformats-officedocument.wordprocessingml.document')
      ext = 'docx';
    cb(
      null,
      `exam-${file.originalname.split('.').shift()}-${req.user.id}.${ext}`
    );
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('application')) cb(null, true);
  else
    cb(new AppError('Wrong file Extention, Please upload only files!'), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadExamPaper = upload.single('exam-paper');
exports.createExam = catchAsync(async (req, res, next) => {
  const examPaper = await Exam.create({
    subject: req.body.subject,
    creator: req.user.id,
    grade: req.body.grade,
    date: req.body.date,
    duration: req.body.duration,
    location: req.body.location,
    semester: req.body.semester,
    examPaper: req.file.filename,
  });

  responseMessage(res, 'Exam Paper Uploaded Successfully', 201, examPaper);
});

exports.showExams = catchAsync(async (req, res, next) => {
  const exams = await Exam.find();

  responseMessage(res, 'Exam Paper Uploaded Successfully', 201, exams);
});

exports.showExam = catchAsync(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) return next(new AppError('Wrong Exam ID!', 404));

  console.log(exam.creator, req.user.id);
  if (req.user.role !== 'admin' && exam.creator != req.user.id)
    return next(
      new AppError("Only Admins or Exam's Creator can access this Exam!", 401)
    );
  responseMessage(res, 'success', 201, exam);
});

exports.createRecord = catchAsync(async (req, res, next) => {
  const record = new ExamRecord({
    studentId: req.body.studentId,
    teacherId: req.user.id,
    examId: req.body.examId,
  });

  const student = await Student.findOne({ userRef: req.body.studentId });
  if (!student) return next(new AppError('Wrong Student ID!', 404));

  student.examRecord.push(record.id);
  // console.log(student);
  await record.save();
  await student.save();

  responseMessage(res, 'Record Created Successfully', 201, record);
});

exports.markExam = catchAsync(async (req, res, next) => {
  const record = await ExamRecord.findById(req.body.examRecordId);
  if (!record) return next(new AppError('Wrong Record ID!', 404));

  if (record.marked)
    return next(new AppError('This Record is already Marked!', 404));

  const student = await Student.findOne({ userRef: req.params.id });
  if (!student) return next(new AppError('Wrong Student ID!', 404));

  if (req.user.role === 'teacher' || req.user.role !== 'admin') {
    if (req.user.id !== record.teacherId)
      return next(
        new AppError('You are not allowed to mark this record!', 401)
      );
  }

  record.markExam(req.body.mark);
  responseMessage(res, 'Record Marked Successfully', 201, record);
});

const createResultObject = async examRecords => {
  examRecords = examRecords.map(async e => {
    let record = await ExamRecord.findById(e);
    record = await record.populate('studentId');
    record = await record.populate('examId');

    const { subject } = await record.examId.populate('subject');
    const { studentId: student } = record;

    return {
      Student: student.fullname,
      Subject: subject.subjectName,
      Mark: record.mark,
    };
  });

  examRecords = await Promise.all(examRecords);

  return examRecords;
};

exports.getExamRecordsByClassId = async (req, res, next) => {
  const targetClass = await Class.findById(req.params.id);
  if (!targetClass) return next(new AppError('Wrong Class ID!', 404));

  if (req.user.role !== 'admin' || req.user.role === 'teacher') {
    if (req.user.id != targetClass.teacherInCharge)
      return next(
        new AppError(`You don't have acccess to perform this action!`, 401)
      );
  }

  const studentsId = targetClass.students;

  let examRecords = studentsId.map(
    async sid => (await Student.findOne({ userRef: sid })).examRecord
  );
  examRecords = await Promise.all(examRecords);
  let a = [];

  for (const e of examRecords) {
    a = a.concat(e);
  }
  examRecords = a;

  const { eId } = req.params;

  examRecords = examRecords.map(async e => {
    const { examId } = await ExamRecord.findById(e);
    if (examId == eId) return e;
  });

  examRecords = await Promise.all(examRecords);
  examRecords = examRecords.filter(e => e != undefined);
  // console.log(examRecords);

  const examResults = await createResultObject(examRecords);

  if (examResults.length === 0)
    return next(new AppError('No Grades Found!', 404));

  responseMessage(res, 'Success', 201, examResults);
};

exports.getExamRecordsByExamId = catchAsync(async (req, res, next) => {
  const exam = await (
    await Exam.findById(req.params.id)
  ).populate('examRecord');

  const { examRecord } = exam;
  responseMessage(res, 'Success', 201, examRecord);
});

// exports.announceClassGrades = catchAsync(async (req, res, next) => {
//   const examRecords = await getClassStudentsExamRecords(req, next);

//   await fs.writeFile(
//     './dev-data/examRecords/record.json',
//     JSON.stringify(examRecords),
//     err => {
//       console.log(err);
//     }
//   );

//   res.render('./');
// });
