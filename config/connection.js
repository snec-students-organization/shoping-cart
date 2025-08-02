const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://shopuser:Ramees1234@cluster0.abcde.mongodb.net/myDatabase?retryWrites=true&w=majority';
mongoose.connect(mongoURI);
 // Change to your DB

mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = db;












