require('dotenv').config();
console.log(process.env);

const express = require('express');
const http = require('node:http');
const bodyParser = require('body-parser');
const db = require('./db');
const cron = require('node-cron');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { producer } = db.connectKafka(app);

const server_config = {
};

require('./routes')(app, producer);

cron.schedule('0 0 * * *', () => {
	console.log('Day ended.');

	producer.send({
    topic: 'time.triggers',
    messages: [{
      key: 'day.ended',
      value: JSON.stringify({
        properties: {
          event_id: '',
          event_version: 1,
          event_time: new Date(),
          producer: 'cron'
        },
        data: {
          manually: false
        }
      })
    }]
  });
});

const server = http.createServer(server_config, app);
server.listen(process.env.PORT, (err) => {
	if (err)
		console.log(err);
	else
		console.log(`Cron service is on port ${process.env.PORT}`);
});
