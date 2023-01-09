const express = require('express');
const User = require('../models/userModel');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get(
  '/show',
  authController.protect,
  authController.restrictTo('admin'),
  userController.showAllUsers
);
router.get(
  '/show/:id',
  authController.protect,
  authController.restrictTo('admin'),
  userController.showSingleUser
);
router.get(
  '/showadmins',
  authController.protect,
  authController.restrictTo('admin'),
  adminController.showAllAdmins
);

router.post(
  '/create',
  authController.protect,
  authController.restrictTo('admin'),
  userController.createNewUser
);

router.post(
  '/assignadmin/:id',
  authController.protect,
  authController.restrictTo('admin'),
  adminController.assignNewAdmin
);

// router.patch('/activate', authController.protect, authController.restrictTo('admin'), adminController.activateUser);

router.patch(
  '/upadate/:id',
  authController.protect,
  authController.restrictTo('admin'),
  userController.updateUser
);
router.delete(
  '/delete/:id',
  authController.protect,
  authController.restrictTo('admin'),
  userController.deleteUser
);

module.exports = router;
