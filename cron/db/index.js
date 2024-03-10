const { Kafka } = require('kafkajs');

exports.connectKafka = (app) => {
  const kafka = new Kafka({
    clientId: 'cron',
    brokers: ['broker:9092'], // Use 'broker' as the hostname
    retry: {
      initialRetryTime: 1000, // Adjust the initial retry time if needed
      retries: 10, // Adjust the maximum number of retries if needed
    },
  });

  const producer = kafka.producer();

  const connectWithRetry = async () => {
    try {
      await producer.connect();
      console.log('Cron service connected to Kafka');
    } catch (error) {
      console.error('Error connecting to Kafka:', error);
      console.log('Retrying in 2 seconds...');
      setTimeout(connectWithRetry, 2000);
    }
  };

  connectWithRetry();

  return { producer };
};