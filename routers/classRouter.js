const express = require('express');
const Class = require('../models/classModel');
const classController = require('../controllers/classController');

const router = express.Router();

router.post('/create', classController.createNewClass);
router.get('/show', classController.showAllClasses);
router.get('/showclass/:cid', classController.showClass);

module.exports = router;
