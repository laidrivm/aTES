const mongoose = require("mongoose");
const { Kafka } = require('kafkajs');

exports.connect = (app) => {
  const options = {
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10 // Maintain up to 10 socket connections
  };

  const connectWithRetry = () => {
    mongoose.Promise = global.Promise;
    console.log(`Accounting service is trying to connect with retry to MongoDB ${process.env.MONGODB_URI}`);
    mongoose
      .connect(process.env.MONGODB_URI, options)
      .then(() => {
        console.log(`Accounting service is connected to MongoDB`);
        app.emit("ready");
      })
      .catch((err) => {
        console.log("Accounting service's connection to MongoDB is unsuccessful, retry after 2 seconds.", err);
        setTimeout(connectWithRetry, 2000);
      });
  };
  connectWithRetry();
};

exports.connectKafka = (app) => {
  const kafka = new Kafka({
    clientId: 'Accounting',
    brokers: ['broker:9092'], // Use 'broker' as the hostname
    retry: {
      initialRetryTime: 1000, // Adjust the initial retry time if needed
      retries: 10, // Adjust the maximum number of retries if needed
    },
  });

  const consumer = kafka.consumer({ groupId: 'accounting-group' });

  const connectWithRetry = async () => {
    try {
      await consumer.connect();
      console.log('Accounting service connected to Kafka');
    } catch (error) {
      console.error('Error connecting to Kafka:', error);
      console.log('Retrying in 2 seconds...');
      setTimeout(connectWithRetry, 2000);
    }
  };

  connectWithRetry();

  return { consumer };
};