const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/basicloginpage');

const db = mongoose.connection;

db.on('error' ,function(){
    console.log('Error while connecting to Database');
});

db.once('open' , function(){
    console.log('Successfully connected to db');
});

module.exports = db;
