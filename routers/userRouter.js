const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/updateme',
  authController.protect,
  userController.updateMe
);
router.post(
  '/updatemypassword',
  authController.protect,
  userController.updateMyPassword
);
// router.post(
//   '/attendece/:id',
//   authController.protect,
//   authController.restrictTo('admin', 'teacher'),
//   userController.submitAttendence
// );
router.delete(
  '/deleteme',
  authController.protect,
  userController.deleteMe
);
module.exports = router;
