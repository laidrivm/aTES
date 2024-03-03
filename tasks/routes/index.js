const express = require("express");
//const serverResponse = require("./responses");
//const messages = require("../config/messages");
//const User = require("../db/user");
const checkToken = require('../middleware/checkToken');

// Middleware to check token
router.use(checkToken);

const routes = (app) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
  });

  app.use("/", router);
};

module.exports = routes;
