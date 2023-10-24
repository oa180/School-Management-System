const express = require('express');
const morgan = require('morgan');
const path = require('path');
const hbs = require('hbs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss');
const cookieParser = require('cookie-parser');
const userRouter = require('./routers/userRouter');
const studentRouter = require('./routers/studentRouter');
const workerRouter = require('./routers/workerRouter');
const classRouter = require('./routers/classRouter');
const teacherRouter = require('./routers/teacherRouter');
const divisionRouter = require('./routers/divisionRouter');
const subjectRouter = require('./routers/subjectRouter');
const authRouter = require('./routers/authRouter');
const adminRouter = require('./routers/adminRouter');
const attendanceRouter = require('./routers/attendanceRouter');
const examRouter = require('./routers/examRouter');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// developing logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, './clientSide/public')));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './clientSide/views/books'));
hbs.registerPartials(path.join(__dirname, './clientSide/layouts'));

// Body Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(req.baseUrl);
  console.log(req.originalUrl);
  next();
});

app.use(
  '/api',
  rateLimit({
    limit: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requsts from the same IP, Please try again later.',
  })
);

app.use(helmet());
app.use(xss());

app.use('/api/v1/user', userRouter);
app.use('/api/v1/student', studentRouter);
app.use('/api/v1/worker', workerRouter);
app.use('/api/v1/class', classRouter);
app.use('/api/v1/teacher', teacherRouter);
app.use('/api/v1/divison', divisionRouter);
app.use('/api/v1/subject', subjectRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/exam', examRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
