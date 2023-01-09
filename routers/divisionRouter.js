const express = require('express');
const Divison = require('../models/divisionModel');
const divisionController = require('../controllers/divisionController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/create',
  authController.protect,
  authController.restrictTo('admin'),
  divisionController.createNewDivison
);
router.get(
  '/show',
  authController.protect,
  authController.restrictTo('admin'),
  divisionController.showAllDivisons
);

module.exports = router;
