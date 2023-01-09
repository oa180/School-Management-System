/* eslint-disable no-useless-catch */
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const responseMessage = require('../utils/responseMessage');
const User = require('../models/userModel');
const Attendance = require('../models/attendanceModel');
const FilterFeatures = require('../utils/filterFeatures');
const Class = require('../models/classModel');
const Student = require('../models/studentModel');

const checkRecordsDuboublication = async (student, date) => {
  try {
    const attendenceRecord = await Attendance.findOne({
      userRef: student.userRef,
      date,
    });

    if (!attendenceRecord) return false;
    return true;
  } catch (error) {
    throw error;
  }
};

const createAttendanceRecord = async (req, student, present = true) => {
  try {
    const date = new Date(req.body.date);
    const dayName = date.toLocaleString('en-us', {
      weekday: 'long',
    });

    if (await checkRecordsDuboublication(student, date))
      throw new Error('Record Already Exists!');

    const attendanceRecord = await Attendance.create({
      userRef: student.userRef,
      submitter: req.user.id,
      date: req.body.date,
      day: dayName,
      present: present,
    });
    return attendanceRecord;
  } catch (e) {
    throw e;
  }
};

exports.userAttendanceRecords = catchAsync(async (req, res, next) => {
  const existedUser = await User.findById(req.params.id);
  if (!existedUser) return next(new AppError('No user with that id'));

  const attendanceRecords = await Attendance.find({
    userRef: existedUser.id,
  });
  if (attendanceRecords.length === 0)
    return next(new AppError('No Attendece records for that user!', 404));

  responseMessage(res, '', 200, attendanceRecords);
});

exports.submitAttendance = catchAsync(async (req, res, next) => {
  const existedStudent = await Student.findById(req.params.id);
  if (!existedStudent) return next(new AppError('No ssstudent with that id'));

  const existedUser = await User.findById(existedStudent.userRef);
  if (!existedUser) return next(new AppError('No user with that id'));

  const attendanceRecord = await createAttendanceRecord(req, existedStudent);

  responseMessage(res, '', 200, attendanceRecord);
});

exports.displayAttendance = catchAsync(async (req, res, next) => {
  const filterReault = new FilterFeatures(Attendance.find(), req.query)
    .filter()
    .sort()
    .fieldSelection()
    .paginate();

  const attendanceRecords = await filterReault.query.explain();

  if (attendanceRecords.length === 0)
    return next(new AppError('No Attendece records!', 404));

  responseMessage(res, '', 200, attendanceRecords);
});

exports.getStudentsAttendance = catchAsync(async (req, res, next) => {
  let attendanceRecords = await Attendance.find().populate('userRef');
  if (attendanceRecords.length === 0)
    return next(new AppError('No Attendece records!', 404));

  attendanceRecords = attendanceRecords.filter(
    record => record.userRef.role === 'student'
  );

  if (attendanceRecords.length === 0)
    return next(new AppError('No Students Attendece records!', 404));

  responseMessage(res, '', 200, attendanceRecords);
});

exports.getTeachersAttendance = catchAsync(async (req, res, next) => {
  let attendanceRecords = await Attendance.find().populate('userRef');
  if (attendanceRecords.length === 0)
    return next(new AppError('No Attendece records!', 404));

  attendanceRecords = attendanceRecords.filter(
    record => record.userRef.role === 'teacher'
  );
  if (attendanceRecords.length === 0)
    return next(new AppError('No Teachers Attendece records!', 404));

  responseMessage(res, '', 200, attendanceRecords);
});

exports.getClassAttendance = catchAsync(async (req, res, next) => {
  const targetedClass = await Class.findById(req.params.id);
  if (!targetedClass) return next(new AppError('No class with that id'));
  // console.log(targetedClass);
  const students = await targetedClass.students;

  // console.log(students);

  let attendanceRecords = students.map(async st => {
    const student = await Student.findOne({ userRef: st });

    return await (
      await student.populate('attendance')
    ).attendance;
  });

  attendanceRecords = await Promise.all(attendanceRecords);

  // let attendanceRecords = students.map(async st => {
  //   console.log(st);
  //   return await st.populate('attendance');
  // });
  // attendanceRecords = await Promise.all(attendanceRecords);
  // console.log(attendanceRecords);

  // const s = await Promise.all(
  //   attendanceRecords[0],
  //   attendanceRecords[1],
  //   attendanceRecords[2]
  // );

  // console.log(s);
  // attendanceRecords = attendanceRecords.map(record => record.attendance);
  responseMessage(res, '', 200, attendanceRecords);
});

exports.studentAttendanceRecords = catchAsync(async (req, res, next) => {
  const existedStudent = await Student.findById(req.params.id);
  if (!existedStudent) return next(new AppError('No student with that id'));

  const existedUser = await User.findById(existedStudent.userRef);
  if (!existedUser) return next(new AppError('No user with that id'));

  const attendanceRecords = await Attendance.find({
    userRef: existedUser.id,
  });
  if (attendanceRecords.length === 0)
    return next(new AppError('No Attendece records for that user!', 404));

  responseMessage(res, '', 200, attendanceRecords);
});

exports.submitClassAttendance = catchAsync(async (req, res, next) => {
  const currentClass = await Class.findById(req.params.id).populate(
    'students',
    '_id'
  );

  if (!currentClass) return next(new AppError('No classes with that id'));

  const classObj = JSON.parse(JSON.stringify(currentClass));

  let attendanceRecord = classObj.students.map(async stId => {
    // console.log(`${stId.id}`);
    const check = req.body.attendedStudents.find(stud => {
      return stId.id === stud;
    });
    // console.log(check);
    if (!check) {
      throw new Error(`Wrong Student Id => ${stId.id}!`);
    }

    const student = await Student.findOne({ userRef: stId._id });

    // const user = await User.findById(student.userRef);
    if (!student) throw new Error('No Student with that id');

    // console.log(user._id);

    if (req.body.attendedStudents.includes(stId._id))
      return createAttendanceRecord(req, student, true);

    return createAttendanceRecord(req, student, false);
  });

  attendanceRecord = await Promise.all(attendanceRecord);
  responseMessage(res, '', 200, attendanceRecord);
});
