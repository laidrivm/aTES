const express = require("express");
const User = require("../db/user");
const InvalidEvent = require('../db/invalidEvent');
const validateSchema = require('ates-schema-registry');

const consume = (consumer) => {
  consumer.subscribe({ topic: 'user.cud' });

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
      	key: message.key.toString(),
        value: JSON.parse(message.value.toString()),
       });
      const key = message.key.toString();
      const value = JSON.parse(message.value.toString());
      if (validateSchema({key, value})) {
        if ((key === 'user.created')&&(value.properties.event_version === 1)) {
          const user = new User({
            user_id: value.data.user_id,
            role: value.data.user_role
          });
          await user.save();
        }
      } else {
        const invalidEvent = new InvalidEvent({
          key,
          value,
          created_at: new Date().toISOString()
        });
      }
    }
  });
}

module.exports = consume;
