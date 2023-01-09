const express = require('express');
const workerController = require('../controllers/workerController');

const router = express.Router();

router.post('/create/:id', workerController.createNewWorker);

router.get('/show', workerController.showAllWorkers);

module.exports = router;
