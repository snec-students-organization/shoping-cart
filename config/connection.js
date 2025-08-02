const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://rameespc17:Ramees1234@cluster0.h9gnra4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Change to your DB

mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = db;












