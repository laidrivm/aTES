const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  description: String,
  jira_id: String,
  status: String,
  assignee: String,
  assigned_price: Number,
  completed_price: Number,
  task_id: String,
  created_at: Date
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
