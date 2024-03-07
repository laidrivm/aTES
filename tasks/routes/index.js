const express = require("express");
const Task = require("../db/task");
const checkToken = require('../middlewares/checktoken');

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

const routes = (app) => {
  const router = express.Router();

  router.use(checkToken);

  router.get("/", async (req, res) => {
    const tasks = await Task.find({ assignee: req.user.user_id });
    res.json(tasks);
  });

  router.get("/task", async (req, res) => {
    res.send(taskScreen);
  });

  router.post("/task", async (req, res) => {
    try {
      const { description } = req.body;
      const assignedPrice = Math.floor(Math.random() * (20 - 10 + 1) + 10);
      const completedPrice = Math.floor(Math.random() * (40 - 20 + 1) + 20);
      const task = new Task({
        description,
        status: "assigned",
        assignee: req.user.user_id,
        assigned_price: assignedPrice,
        completed_price: completedPrice
      });
      await task.save();
      res.redirect('/');
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.use("/", router);
};

module.exports = routes;
