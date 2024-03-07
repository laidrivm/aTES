const mongoose = require("mongoose");
const { Kafka } = require('kafkajs');

exports.connect = (app) => {
  const options = {
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10 // Maintain up to 10 socket connections
  };

  const connectWithRetry = () => {
    mongoose.Promise = global.Promise;
    console.log(`Tasks service is trying to connect with retry to MongoDB ${process.env.MONGODB_URI}`);
    mongoose
      .connect(process.env.MONGODB_URI, options)
      .then(() => {
        console.log(`Tasks service is connected to MongoDB`);
        app.emit("ready");
      })
      .catch((err) => {
        console.log("Tasks service's connection to MongoDB is unsuccessful, retry after 2 seconds.", err);
        setTimeout(connectWithRetry, 2000);
      });
  };
  connectWithRetry();
};

exports.connectKafka = (app) => {
  const kafka = new Kafka({
    clientId: 'tasks',
    brokers: ['broker:9092'], // Use 'broker' as the hostname
    retry: {
      initialRetryTime: 1000, // Adjust the initial retry time if needed
      retries: 10, // Adjust the maximum number of retries if needed
    },
  });

  const producer = kafka.producer();
  const consumer = kafka.consumer({ groupId: 'tasks-group' });

  const connectWithRetry = async () => {
    try {
      await producer.connect();
      await consumer.connect();
      console.log('Auth service connected to Kafka');

      // Subscribe to topics, run consumers, etc.
      await consumer.subscribe({ topic: 'auth-topic' });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log({
            value: message.value.toString(),
          });
        },
      });
    } catch (error) {
      console.error('Error connecting to Kafka:', error);
      console.log('Retrying in 2 seconds...');
      setTimeout(connectWithRetry, 2000);
    }
  };

  connectWithRetry();

  return { producer, consumer };
};