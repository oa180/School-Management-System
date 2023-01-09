const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/login', authController.renderLogin);
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/forgetpassword', authController.forgetPassword);
router.post('/resetpassword/:token', authController.resetPassword);

module.exports = router;
