const mongoose = require('mongoose');
const validator = require('validator');

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, 'A Class must have a name!'],
    },
    classNumber: {
      type: String,
      required: [true, 'A Class must have a class number!'],
    },
    classSequence: {
      type: String,
      required: [
        true,
        'A Class must have a sequence code in form [level/class_number]!',
      ],
      unique: true,
      default: '0/0',
    },
    teacherInCharge: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A Class must have a teacher in charge!'],
      unique: true,
    },
    capacity: {
      type: Number,
      required: [true, 'A Class must have a capacity!'],
    },
    numberOfStudents: {
      type: Number,
      // required: [true, 'A Class must have a number of students!'],
    },
    students: {
      type: [mongoose.Schema.ObjectId],
      ref: 'User',
    },
    location: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

classSchema.pre('save', function (next) {
  if (this.isModified('students') || this.isNew)
    this.numberOfStudents = this.students.length;
  next();
});
module.exports = mongoose.model('Class', classSchema);
