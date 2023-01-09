const mongoose = require('mongoose');
const validator = require('validator');

const schema = new mongoose.Schema(
  {
    divisionCode: {
      type: String,
      enum: {
        values: ['AR', 'EN', 'MA', 'SC', 'LI', 'GE'],
        message: 'Division code invalid!',
      },
      required: [true, 'A division must have a code!'],
      unique: true,
    },
    subjects: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Subject',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Division', schema);
