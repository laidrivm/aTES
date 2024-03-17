const mongoose = require('mongoose');

const invalidEventSchema = new mongoose.Schema({
  key: String,
  value: Object,
  created_at: String
});

const InvalidEvent = mongoose.model('InvalidEvent', invalidEventSchema);

module.exports = InvalidEvent;
