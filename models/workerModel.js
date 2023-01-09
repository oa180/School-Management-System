const mongoose = require('mongoose');
const validator = require('validator');

const schema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'MISSING USER REFRENCE!!!'],
    },
    jobType: {
      type: String,
      required: [true, 'A worker must have job title!'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Worker', schema);
