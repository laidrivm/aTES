const mongoose = require('mongoose');

// Define the schema
const userSchema = new mongoose.Schema({
  user_id: String,
  role: String,
  balance: Number
});

// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User;
