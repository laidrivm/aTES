const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: String,
  role: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;
