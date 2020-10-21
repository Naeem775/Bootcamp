const mongoose = require('mongoose');
const Bootcamp = require('./models/Bootcamp');
const dotenv = require('dotenv');
const fs = require('fs');
const catchAsync = require('./utils/catchAsync');

dotenv.config({path:'./config/config.env'})

const DB = process.env.MONGO_URI
mongoose.connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
}).then(() => console.log('database is connected successfully'))
    .catch(err => console.log(err));

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

const importData = catchAsync( async () => {
    await Bootcamp.create(bootcamps);
});

const deleteData = catchAsync(async () => {
    await Bootcamp.deleteMany();
});

if(process.argv[2] === '-i'){
    importData()
    console.log('Data imported successfully...');
}else if(process.argv[2] === '-d'){
    deleteData()
    console.log('Data deleted successfully');
}

