const mongoose = require('mongoose');
const validator = require('validator');

const schema = new mongoose.Schema(
  {
    subjectCode: {
      type: String,
      required: [true, 'A Subject must have a code!'],
      unique: true,
      validate: {
        validator: function (el) {
          const codes = ['AR', 'EN', 'MA', 'SC', 'LI', 'GE'];
          // eslint-disable-next-line no-restricted-syntax
          for (const cd of codes) {
            if (el.startsWith(cd)) return true;
          }
          return false;
        },
        message: `Wrong division code!`,
      },
    },
    subjectName: {
      type: String,
      required: [true, 'A Subject must have a name!'],
      unique: true,
    },
    division: {
      type: mongoose.Schema.ObjectId,
      ref: 'Division',
      required: [true, 'A Subject must have a divison!'],
    },
    bookName: {
      type: String,
      required: [true, 'A book must have a name!'],
      unique: true,
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: 'Teacher',
      required: [true, 'A Subject must have a teacher!'],
    },
    students: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Student',
    },
    grade: {
      type: Number,
      required: [true, 'A Subject must have a grade!'],
    },
    exam: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Exam',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Subject', schema);
