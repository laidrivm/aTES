const mongoose = require('mongoose');

// Define the schema
const userSchema = new mongoose.Schema({
  user_id: String,
  user_secret: String,
  role: String,
  account_id: String
});

// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User;
