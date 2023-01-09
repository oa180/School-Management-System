const mongoose = require('mongoose');
const validator = require('validator');

const schema = new mongoose.Schema(
  {},
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Parent', schema);
