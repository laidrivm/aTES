const express = require("express");
const User = require("../db/user");
const Task = require("../db/task");
const Transaction = require("../db/transaction");

const consume = (consumer) => {
  consumer.subscribe({ topic: 'user.cud' });
  consumer.subscribe({ topic: 'task.cud' });
  consumer.subscribe({ topic: 'time.triggers' });

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
      	key: message.key.toString(),
        value: JSON.parse(message.value.toString()),
       });

      const key = message.key.toString();
      const value = JSON.parse(message.value.toString());

      if (key==='user.created') {
        const user = new User({
          user_id: value.data.user_id,
          role: value.data.user_role,
          balance: 0
        });
        await user.save();
      }

      if (key==='user.updated'){

      }

      if (key==='task.created'){
        const task = new Task({
          task_id: value.data.task_id,
          description: value.data.task_description,
          jira_id: value.data.jira_id,
          assignee: value.data.task_assignee,
          assigned_price: value.data.assigned_price,
          completed_price: value.data.completed_price
        });
        await task.save();

        const transaction = new Transaction({
          account_id: value.data.task_assignee,
          task_id: value.data.task_id,
          type: 'credit',
          amount: value.data.assigned_price
        });
        await transaction.save();

        await User.findOneAndUpdate(
          { user_id: value.data.task_assignee },
          { $inc: { balance: -value.data.assigned_price } }
        );
      }

      if (key==='task.updated'){
        //possible way to reassign task without charging assigned price
        await User.findOneAndUpdate(
          { task_id: value.data.task_id },
          {
            description: value.data.task_description,
            jira_id: value.data.jira_id,
            assignee: value.data.task_assignee,
          }
        );

        if (value.data.assigned_price) {
          await User.findOneAndUpdate(
            { task_id: value.data.task_id },
            { assigned_price: value.data.assigned_price }
          );
        }

        if (value.data.completed_price) {
          await User.findOneAndUpdate(
            { task_id: value.data.task_id },
            { completed_price: value.data.completed_price }
          );
        }
      }
          
      if (key==='task.closed') {
        const task = await Task.findOneAndUpdate(
          { task_id: value.data.task_id },
          { status: "closed" },
          { new: true }
        );

        const transaction = new Transaction({
          account_id: task.assignee,
          task_id: task.task_id,
          type: 'debit',
          amount: task.completed_price
        });
        await transaction.save();

        await User.findOneAndUpdate(
          { user_id: task.assignee },
          { $inc: { balance: task.completed_price } }
        );
      }

      if (key==='task.assigned') {
        const task = await Task.findOneAndUpdate(
          { task_id: value.data.task_id },
          { assignee: value.data.task_assignee },
          { new: true }
        );

        const transaction = new Transaction({
          account_id: task.assignee,
          task_id: task.task_id,
          type: 'credit',
          amount: task.assigned_price
        });
        await transaction.save();

        await User.findOneAndUpdate(
          { user_id: task.assignee },
          { $inc: { balance: -task.assigned_price } }
        );
      }

      if (key==='day.ended') {
        const users = await User.find({ balance: { $gt: 0 } });
        users.forEach(async (user) => {
          const transaction = new Transaction({
            account_id: user.user_id,
            type: 'payment',
            amount: user.balance
          });
          await transaction.save();
          user.balance = 0;
          await user.save();
        });
      }
    }
  });
}

module.exports = consume;
              