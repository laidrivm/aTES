const express = require("express");
//const Task = require("../db/task");
const User = require("../db/user");

const routes = (app, producer) => {
  const router = express.Router();

  router.get("/users", async (req, res) => {
    const users = await User.find({});
    res.json(users);
  });

  app.use("/", router);
};

module.exports = routes;