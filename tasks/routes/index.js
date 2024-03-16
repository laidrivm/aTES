require('dotenv').config();
const express = require("express");
const Task = require("../db/task");
const User = require("../db/user");
const checkToken = require('../middlewares/checktoken');
const validateSchema = require('ates-schema-registry');
const crypto = require('node:crypto');

const taskScreen = `
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('taskForm');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const description = document.getElementById('description').value;
      const jira_id = document.getElementById('jira_id').value;

      try {
        const response = await fetch("/task", {
          method: 'POST',
          headers: {
            'Content-Type': 'application\/json'
          },
          body: JSON.stringify({ jira_id, description })
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
  <label for="jira_id">Jira_id:<\/label>
  <input type="text" id="jira_id" name="jira_id"><br>
  <label for="description">Task description:<\/label>
  <input type="text" id="description" name="description"><br>
  <input type="submit" value="Create">
<\/form>
`;

const shuffleScreen = `
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const shuffleButton = document.getElementById('shuffleButton');

    shuffleButton.addEventListener('click', async () => {
      try {
        const response = await fetch("/shuffle", {
          method: 'POST',
          headers: {
            'Content-Type': 'application\/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to shuffle tasks');
        }

        window.location.href = "\/";
      } catch (error) {
        console.error('Error during shuffling tasks:', error);
      }
    });
  });
<\/script>

<button id="shuffleButton">Shuffle tasks<\/button>
`;

const tasksScreenScript = `
<script>
  async function closeTask(taskId, button) {
    try {
      const response = await fetch('\/close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application\/json'
        },
        body: JSON.stringify({ taskId })
      });

      if (!response.ok) {
        throw new Error('Failed to close task');
      }

      button.style.display = 'none';
    } catch (error) {
      console.error('Error closing task:', error);
    }
  }
<\/script>

`;

function hasJiraId(description) {
  const regex = /\[.*\]/;
  return regex.test(description);
}

const routes = (app, producer) => {
  const router = express.Router();

  router.use(checkToken);

  router.get("/", async (req, res) => {
    const tasks = await Task.find({ assignee: req.user.user_id, status: "assigned" });
    let tasksScreen = tasksScreenScript;
    tasks.forEach(task => {
      tasksScreen += `<p>Description: ${task.description}, Assigned Price: ${task.assigned_price}, Completed Price: ${task.completed_price}<\/p>
        <button onclick="closeTask('${task._id}', this)">Close<\/button>
      `;
    });
    res.send(tasksScreen);
  });

  router.post("/close", async (req, res) => {
    try {
      const { taskId } = req.body;
      const task = await Task.findOneAndUpdate({ _id: taskId }, { status: "closed" }, { new: true });

      let event = {
        key: 'task.closed',
        value: {
          properties: {
            event_id: crypto.randomUUID(),
            event_version: 1,
            event_time: new Date().toISOString(),
            producer: 'tasks'
          },
          data: {
            task_id: task.external_id
          }
        }
      };

      if (validateSchema(event)){
        event.value = JSON.stringify(event.value);
        await producer.send({
          topic: 'task.cud',
          messages: [event]
        });
      }

      res.redirect('/');
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
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
      const { jira_id, description } = req.body;

      console.log(req.body);
      console.log(jira_id);
      console.log(description);

      if (hasJiraId(description)) {
        return res.status(400).json({ error: "Jira_id in description" });
      }

      const assignedPrice = Math.floor(Math.random() * (20 - 10 + 1) + 10);
      const completedPrice = Math.floor(Math.random() * (40 - 20 + 1) + 20);
      const users = await User.find({ role: 'doer' });
      const randomIndex = Math.floor(Math.random() * users.length);
      const randomAssignee = users[randomIndex];
      const externalId = crypto.randomUUID();
      const task = new Task({
        description,
        jira_id,
        status: "assigned",
        assignee: randomAssignee.user_id,
        assigned_price: assignedPrice,
        completed_price: completedPrice,
        external_id: externalId
      });
      await task.save();

      let event = {
        key: 'task.created',
        value: {
          properties: {
            event_id: crypto.randomUUID(),
            event_version: 1,
            event_time: new Date().toISOString(),
            producer: 'tasks'
          },
          data: {
            task_description: task.description,
            task_assignee: task.assignee,
            assigned_price: task.assigned_price,
            completed_price: task.completed_price,
            task_id: task.external_id
          }
        }
      };

      if (process.env.TASKEVENTV2 === 'true') {
        event.value.properties.event_version = 2;
        event.data.jira_id = task.jira_id;
      }

      if (validateSchema(event)){
        event.value = JSON.stringify(event.value);
        await producer.send({
          topic: 'task.cud',
          messages: [event]
        });
      }

      res.redirect('/');
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/shuffle", async (req, res) => {
    res.send(shuffleScreen);
  });

  router.post("/shuffle", async (req, res) => {
    try {
      const tasks = await Task.find({ status: 'assigned' });
      const doers = await User.find({ role: 'doer' });

      const totalTasks = tasks.length;
      const totalDoers = doers.length;
      const messages = [];

      for (let i = 0; i < totalTasks; i++) {
        const randomIndex = Math.floor(Math.random() * totalDoers);
        const randomDoer = doers[randomIndex];
        const task = await Task.findOneAndUpdate({ _id: tasks[i]._id }, { assignee: randomDoer.user_id }, { new: true });

        let event = {
        key: 'task.assigned',
          value: {
            properties: {
              event_id: crypto.randomUUID(),
              event_version: 1,
              event_time: new Date().toISOString(),
              producer: 'tasks'
            },
            data: {
              task_assignee: task.assignee,
              task_id: task.external_id
            }
          }
        };

        if (validateSchema(event)){
          event.value = JSON.stringify(event.value);
          messages.push(event);
        }
      }

      await producer.send({
        topic: 'task.cud',
        messages
      });

      res.redirect('/');
    } catch (error) {
      console.error("Error shuffling tasks:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.use("/", router);
};

module.exports = routes;
