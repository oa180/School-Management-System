const express = require('express');
const Class = require('../models/classModel');
const classController = require('../controllers/classController');

const router = express.Router();

router.post('/create', classController.createNewClass);
router.get('/show', classController.showAllClasses);

module.exports = router;
