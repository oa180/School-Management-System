const express = require('express');
const Subject = require('../models/subjectModel');
const subjectController = require('../controllers/subjectController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/create',
  authController.protect,
  authController.restrictTo('admin'),
  subjectController.createNewSubject
);
router.get(
  '/show',
  authController.protect,
  authController.restrictTo('admin'),
  subjectController.showAllSubjects
);

module.exports = router;
