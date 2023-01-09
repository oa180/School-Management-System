const express = require('express');
const authController = require('../controllers/authController');
const examController = require('../controllers/examController');

const router = express.Router();

router.use(authController.protect);

router.get(
  '/show',
  authController.restrictTo('admin'),
  examController.showExams
);
router.get(
  '/show/:id',
  authController.restrictTo('admin', 'teacher'),
  examController.showExam
);
router.post(
  '/create',
  authController.restrictTo('admin', 'teacher'),
  examController.uploadExamPaper,
  examController.createExam
);

router.post(
  '/takeExam',
  authController.restrictTo('admin'),
  examController.createRecord
);
router.post(
  '/markstudentexam/:id',
  authController.restrictTo('admin', 'teacher'),
  examController.markExam
);

router.get(
  '/class-exam-records/:id/exam/:eId',
  authController.restrictTo('admin', 'teacher'),
  examController.getExamRecordsByClassId
);
router.get(
  '/exam-records/:id',
  authController.restrictTo('admin', 'teacher'),
  examController.getExamRecordsByExamId
);
module.exports = router;
