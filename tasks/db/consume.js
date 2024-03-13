const express = require("express");
const User = require("../db/user");

const consume = (consumer) => {
  // Subscribe to topics, run consumers, etc.
  consumer.subscribe({ topic: 'user.cud' });

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
      	key: message.key.toString(),
        value: JSON.parse(message.value.toString()),
       });
      const key = message.key.toString();
      const value = JSON.parse(message.value.toString());
      if (key === 'user.created') {
	    const user = new User({
	      user_id: value.data.user_id,
	      role: value.data.user_role
	    });
	    await user.save();
      }
    }
  });
}

module.exports = consume;
