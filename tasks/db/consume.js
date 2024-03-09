const consume = (consumer) => {
  // Subscribe to topics, run consumers, etc.
  consumer.subscribe({ topic: 'user.cud' });

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
      	key: message.key.toString(),
        value: message.value.toString()
       });
    },
  });
}

module.exports = consume;
