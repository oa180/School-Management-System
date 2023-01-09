const express = require('express');
const teacherController = require('../controllers/teacherController');

const router = express.Router();

router.post('/create/:id', teacherController.createNewTeacher);
router.get('/show', teacherController.showAllTeacheres);

module.exports = router;
