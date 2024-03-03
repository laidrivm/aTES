const mongoose = require('mongoose');

// Define the schema
const tokenSchema = new mongoose.Schema({
  client_id: String,
  client_secret: String
});

// Create the model
const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
