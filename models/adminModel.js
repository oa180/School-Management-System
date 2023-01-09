const mongoose = require('mongoose');
const validator = require('validator');

const schema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'MISSING USER REFRENCE!!!'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Admin', schema);
