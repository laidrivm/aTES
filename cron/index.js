require('dotenv').config();
console.log(process.env);

const express = require('express');
const http = require('node:http');
const bodyParser = require('body-parser');
const db = require('./db');
const cron = require('node-cron');
const validateSchema = require('ates-schema-registry');
const crypto = require('node:crypto');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { producer } = db.connectKafka(app);

const server_config = {
};

require('./routes')(app, producer);

cron.schedule('0 0 * * *', async () => {
  let event = {
    key: 'day.ended',
    value: {
      properties: {
        event_id: crypto.randomUUID(),
        event_version: 1,
        event_time: new Date().toISOString(),
        producer: 'cron'
      },
      data: {
        manually: false
      }
    }
  };

  if (validateSchema(event)){
    event.value = JSON.stringify(event.value);
    await producer.send({
      topic: 'time.triggers',
      messages: [event]
    });
  }
});

const server = http.createServer(server_config, app);
server.listen(process.env.PORT, (err) => {
	if (err)
		console.log(err);
	else
		console.log(`Cron service is on port ${process.env.PORT}`);
});
