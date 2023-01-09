const Division = require('../models/divisionModel');
const catchAsync = require('../utils/catchAsync');
const responseMessage = require('../utils/responseMessage');

exports.createNewDivison = catchAsync(async (req, res) => {
  const newDivison = await Division.create({
    divisionCode: req.body.divisionCode,
  });

  responseMessage(res, 'New Division Created', 201, newDivison);
});

exports.showAllDivisons = catchAsync(async (req, res) => {
  const divisions = await Division.find({});
  responseMessage(res, '', 201, divisions);
});
