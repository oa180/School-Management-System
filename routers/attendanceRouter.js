const express = require('express');
const authController = require('../controllers/authController');
const attendenceController = require('../controllers/attendanceController');

const router = express.Router();

router.use(
  authController.protect,
  authController.restrictTo('admin', 'teacher')
);

router.get('/display', attendenceController.displayAttendance);

router
  .route('/user/:id')
  .post(attendenceController.submitAttendance)
  .get(attendenceController.userAttendanceRecords);

router.get('/student', attendenceController.getStudentsAttendance);
router.get('/teacher', attendenceController.getTeachersAttendance);
router.get('/class/:id', attendenceController.getClassAttendance);
router.post('/class/:id', attendenceController.submitClassAttendance);
router.get('/student/:id', attendenceController.studentAttendanceRecords);

module.exports = router;
