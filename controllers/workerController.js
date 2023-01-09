const Worker = require('../models/workerModel');
const catchAsync = require('../utils/catchAsync');

exports.createNewWorker = catchAsync(async (req, res) => {
  const newWorker = await Worker.create({
    userRef: req.params.id,
    ...req.body,
  });
  res.send(newWorker);
});

exports.showAllWorkers = catchAsync(async (req, res) => {
  const Workers = await Worker.find({});
  res.send(Workers);
});
