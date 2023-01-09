const mongoose = require('mongoose');
const validator = require('validator');
const Subject = require('./subjectModel');
const Class = require('./classModel');

const examSchema = new mongoose.Schema(
  {
    examPaper: {
      type: String,
      unique: [true, 'Exam Already Exists'],
      required: true,
    },
    subject: {
      type: mongoose.Schema.ObjectId,
      ref: 'Subject',
      required: true,
      validate: {
        validator: async function (el) {
          const subjectDoc = await Subject.findById(el);
          if (!subjectDoc) return false;
          return true;
        },
        message: 'Wrong Subject Id!',
      },
    },
    creator: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: 'Teacher',
    },
    location: {
      type: mongoose.Schema.ObjectId,
      ref: 'Class',
      required: true,
      validate: {
        validator: async function (el) {
          const classDoc = await Class.findById(el);
          if (!classDoc) return false;
          return true;
        },
        message: 'Wrong Class Id!',
      },
    },

    grade: Number,
    date: Date,
    duration: Number,
    semester: String,
    year: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

examSchema.virtual('examRecord', {
  ref: 'Exam-Record',
  localField: '_id',
  foreignField: 'examId',
});

examSchema.pre('save', function (next) {
  this.year = new Date(this.date).getFullYear();
  next();
});

module.exports = mongoose.model('Exam', examSchema);
