const mongoose = require('mongoose');
const validator = require('validator');

const studentSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'MISSING USER REFRENCE!!!'],
      unique: true,
    },
    parent: {
      type: mongoose.Schema.ObjectId,
      ref: 'Parent',
    },
    currentLevel: {
      type: Number,
      required: [true, 'A Student must have a current level!'],
      min: [1, 'Years must be between 1 : 12'],
      max: [12, 'Years must be between 1 : 12'],
    },
    subjects: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Subject',
    },
    examRecord: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Exam-Record',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentSchema.virtual('attendance', {
  ref: 'Attendance',
  localField: 'userRef',
  foreignField: 'userRef',
});

module.exports = mongoose.model('Student', studentSchema);
