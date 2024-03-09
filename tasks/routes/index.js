const express = require("express");
const Task = require("../db/task");
const User = require("../db/user");
const checkToken = require('../middlewares/checktoken');
const crypto = require('node:crypto');

const taskScreen = `
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('taskForm');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const description = document.getElementById('description').value;

      try {
        const response = await fetch("/task", {
          method: 'POST',
          headers: {
            'Content-Type': 'application\/json'
          },
          body: JSON.stringify({ description })
        });

        if (!response.ok) {
          throw new Error('Failed to create task');
        }

        window.location.href = "\/";
      } catch (error) {
        console.error('Error during authentication:', error);
      }
    });
  });
<\/script>

<form id="taskForm">
  <label for="description">Task description:<\/label>
  <input type="text" id="description" name="description"><br>
  <input type="submit" value="Create">
<\/form>
`

const routes = (app, producer) => {
  const router = express.Router();

  router.use(checkToken);

  router.get("/", async (req, res) => {
    const tasks = await Task.find({ assignee: req.user.user_id });
    res.json(tasks);
  });

  router.get("/users", async (req, res) => {
    const users = await User.find({});
    res.json(users);
  });

  router.get("/task", async (req, res) => {
    res.send(taskScreen);
  });

  router.post("/task", async (req, res) => {
    try {
      const { description } = req.body;
      const assignedPrice = Math.floor(Math.random() * (20 - 10 + 1) + 10);
      const completedPrice = Math.floor(Math.random() * (40 - 20 + 1) + 20);
      const users = await User.find({ role: 'doer' });
      const randomIndex = Math.floor(Math.random() * users.length);
      const randomAssignee = users[randomIndex];
      const externalId = crypto.randomUUID();
      const task = new Task({
        description,
        status: "assigned",
        assignee: randomAssignee.user_id,
        assigned_price: assignedPrice,
        completed_price: completedPrice,
        external_id: externalId
      });
      await task.save();

      await producer.send({
        topic: 'task.cud',
        messages: [{
          key: 'task.created',
          value: JSON.stringify({
            properties: {
              event_id: '',
              event_version: 1,
              event_time: '',
              producer: 'tasks'
            },
            data: {
              task_description: task.description,
              task_assignee: task.assignee,
              assigned_price: task.assigned_price,
              completed_price: task.completed_price,
              task_id: task.external_id
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
