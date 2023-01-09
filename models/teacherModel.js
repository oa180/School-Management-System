const mongoose = require('mongoose');
const validator = require('validator');

const schema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'MISSING USER REFRENCE!!!'],
      unique: true,
    },
    qualification: {
      type: Array,
      required: [true, 'A teacher must have qualifications!'],
    },
    subject: {
      type: mongoose.Schema.ObjectId,
      ref: 'Subject',
    },
    joiningDate: Date,
    leavingDate: Date,
    workingHours: Number,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
schema.methods.toJSON = function () {
  const data = this.toObject();
  delete data.__v;
  delete data.password;
  delete data.userRef.id;
  // delete data.tokens
  return data;
};
schema.pre(/^find/, function (next) {
  this.populate({ path: 'userRef', select: 'fullname email role' });
  next();
});
module.exports = mongoose.model('Teacher', schema);
