const express = require('express');
const studentController = require('../controllers/studentController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/create/:id', studentController.createNewStudent);

router.get(
  '/show',
  authController.protect,
  authController.restrictTo('admin'),
  studentController.showAllStudents
);
router.post(
  '/enroll/:subjectId',
  authController.protect,
  authController.restrictTo('student', 'admin'),
  studentController.enroll
);

module.exports = router;
