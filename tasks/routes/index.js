const express = require("express");
//const serverResponse = require("./responses");
//const messages = require("../config/messages");
//const User = require("../db/user");
const checkToken = require('../middlewares/checktoken');

const routes = (app) => {
  const router = express.Router();

  router.use(checkToken);

  router.get("/",(req, res) => {
    res.send("no tasks yet");
  });

  app.use("/", router);
};

module.exports = routes;
