const express = require("express");

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
      await producer.send({
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
              manually: true
            }
          })
        }]
      });
      res.redirect('/');
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.use("/", router);
};

module.exports = routes;
