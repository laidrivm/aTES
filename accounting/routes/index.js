const express = require("express");
const Task = require("../db/task");
const User = require("../db/user");

const routes = (app, producer) => {
  const router = express.Router();

  router.get("/users", async (req, res) => {
    const users = await User.find({});
    res.json(users);
  });

  router.get("/tasks", async (req, res) => {
    const tasks = await Task.find({});
    res.json(tasks);
  });


  app.use("/", router);
};

module.exports = routes;