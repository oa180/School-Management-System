const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', false);
mongoose
  .connect(DB)
  .then(() => {
    console.log('Database Connection Successfull...');
    const port = process.env.PORT || 5555;
    app.listen(port, () => {
      console.log(
        `SMS Running on port ${port}...\nhttp://localhost:${port}/api/v1/auth/login`
      );
    });
  })
  .catch(err => {
    console.log(err);
  });
