const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fileupload = require('express-fileupload');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const APIError = require('./utils/APIError');

// Routers
const bootcampRouter = require('./routes/bootcamproutes');
const userRouter = require('./routes/userRoutes');
const courseRouters = require('./routes/courseRoutes');
const reviewRouter = require('./routes/reviewsRouter');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception, Shutting Down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config/config.env' });

const app = express();

app.use(express.json());

app.use(fileupload());
// Static Path
app.use(express.static(path.join(__dirname, 'public')));

// Mounting Routes
app.use('/api/v1/bootcamps', bootcampRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/courses', courseRouters);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new APIError(`Can not find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

// Connecting to the database
const DB = process.env.MONGO_URI;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('database is connected successfully'))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;

// Running Server
const server = app.listen(PORT, () =>
  console.log(
    `server is running on port: ${PORT} in ${process.env.NODE_ENV} mode`
  )
);

// Handling unhandled Rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection, Shutting Down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
