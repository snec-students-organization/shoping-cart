const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://rameespc17:Ramees1234@cluster0.h9gnra4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch(err => {
  console.error('Initial connection error:', err);
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

db.on('disconnected', () => {
  console.warn('MongoDB connection lost. Attempting reconnect...');
});

module.exports = db;













