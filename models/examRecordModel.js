const mongoose = require('mongoose');

const examRecordeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  teacherId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  examId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Exam',
  },
  marked: {
    type: Boolean,
    default: false,
  },
  mark: {
    type: Number,
    default: 0,
  },
});

examRecordeSchema.methods.markExam = async function (mark) {
  this.mark = mark;
  this.marked = true;
  this.save();
};

const examRecord = mongoose.model('Exam-Record', examRecordeSchema);
module.exports = examRecord;
