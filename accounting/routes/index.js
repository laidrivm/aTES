const express = require("express");
const Task = require("../db/task");
const User = require("../db/user");
const Transaction = require("../db/transaction");
const checkToken = require('../middlewares/checktoken');

const routes = (app, producer) => {
  const router = express.Router();

  router.use(checkToken);

  

  router.get("/users", async (req, res) => {
    const users = await User.find({});
    res.json(users);
  });

  router.get("/tasks", async (req, res) => {
    const tasks = await Task.find({});
    res.json(tasks);
  });

  router.get("/transactions", async (req, res) => {
    const transactions = await Transaction.find({});
    res.json(transactions);
  });

  app.use("/", router);
};

module.exports = routes;