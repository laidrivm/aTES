const express = require("express");
const User = require("../db/user");
const Task = require("../db/task");

const consume = (consumer) => {
  consumer.subscribe({ topic: 'user.cud' });
  consumer.subscribe({ topic: 'task.cud' })

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
      	key: message.key.toString(),
        value: JSON.parse(message.value.toString()),
       });

      const key = message.key.toString();
      const value = JSON.parse(message.value.toString());

      switch (key) {
        case 'user.created':
          const user = new User({
            user_id: value.data.user_id,
            role: value.data.user_role,
            balance: 0
          });
          await user.save();
          break;
        case 'user.updated':
          break;
        case 'task.created':
          const task = new Task({
            task_id: value.data.task_id,
            description: value.data.task_description,
            assignee: value.data.task_assignee,
            assigned_price: value.data.assigned_price,
            completed_price: value.data.completed_price
          });
          await task.save();
          break;
        case 'task.closed':
          break;
        case 'task.assigned':
          break;
      }
    }
  });
}

module.exports = consume;
              