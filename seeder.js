const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const catchAsync = require('./utils/catchAsync');

dotenv.config({ path: './config/config.env' });

const DB = process.env.MONGO_URI;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .catch((err) => console.log(err));

const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

const importData = catchAsync(async () => {
  await Bootcamp.create(bootcamps);
  await Course.create(courses);
  console.log('Data imported successfully...');
});

const deleteData = catchAsync(async () => {
  await Bootcamp.deleteMany();
  await Course.deleteMany();
  console.log('Data deleted successfully');
});

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
