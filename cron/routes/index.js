const express = require("express");
const validateSchema = require('ates-schema-registry');
const crypto = require('node:crypto');

const mainScreen = `
<script>
  async function endDay(button) {
    try {
      const response = await fetch('\/endday', {
        method: 'POST',
        headers: {
          'Content-Type': 'application\/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to end day');
      }

      button.disabled = true;
    } catch (error) {
      console.error('Error ending day:', error);
    }
  }
<\/script>
<button onclick="endDay(this)">End day<\/button>
`;

const routes = (app, producer) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
  	res.send(mainScreen);
  });

  router.post("/endday", async (req, res) => {
    try {
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
            manually: true
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

      res.redirect('/');
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.use("/", router);
};

module.exports = routes;
