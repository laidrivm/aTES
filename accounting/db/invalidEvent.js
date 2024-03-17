const mongoose = require('mongoose');

const invalidEventSchema = new mongoose.Schema({
  message: String,
  created_at: String
});

const InvalidEvent = mongoose.model('InvalidEvent', invalidEventSchema);

module.exports = InvalidEvent;
