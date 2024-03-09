const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  account_id: String,
  task_id: String,
  type: String,
  amount: Number
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
