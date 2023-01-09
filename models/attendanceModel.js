const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: true,
    },
    submitter: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: true,
    },
    present: {
      type: Boolean,
      default: false,
    },
    date: Date,
    day: String,
  },
  { timestamps: true }
);

attendanceSchema.index({ date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
