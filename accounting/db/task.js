const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  description: String,
  status: String,
  assignee: String,
  assigned_price: Number,
  completed_price: Number,
  task_id: String
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
