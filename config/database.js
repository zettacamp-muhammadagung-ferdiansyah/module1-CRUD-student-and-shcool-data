// MongoDB connection setup
const mongoose = require('mongoose');

function connectDatabase() {
  return mongoose.connect('mongodb://localhost:27017/module1', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

module.exports = connectDatabase;
