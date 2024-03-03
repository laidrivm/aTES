const express = require("express");
//const serverResponse = require("./responses");
//const messages = require("../config/messages");
const User = require("../db/user");
const jwt = require('jsonwebtoken');

const routes = (app) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
        // Retrieve all records from the clients collection
        const userss = await User.find({}, { _id: 1, client_id: 1, client_secret: 1 });
        
        // res.json(users);
        res.send(users);
    } catch (error) {
        // Handle errors
        console.error("Error retrieving tokens:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/authenticate", async (req, res) => {
    try {
        const { user_id, user_secret } = req.body;
        // TODO ADD HASH HERE

        // Check if a token already exists for the given user_id and user_secret
        let user = await User.findOne({ user_id, user_secret });

        // If no token found, create a new one
        if (!user) {
            // Create a new token
            user = new User({ user_id, user_secret });

            // Save the token to the database
            await user.save();
        }

        // Create a JWT token
        const jwtPayload = { user_id: token.user_id };
        const jwtToken = jwt.sign(jwtPayload, process.env.SECRET);

        //res.json({ token: jwtToken });
        res.send(jwtToken);
    } catch (error) {
        console.error("Error authenticating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/authorize", (req, res) => {

  });

  router.post("/verify", (req, res) => {

  });

  app.use("/", router);
};
module.exports = routes;

  /*router.post("/todos", (req, res) => {
    const todo = new Todo({
      text: req.body.text,
    });

    todo
      .save()
      .then((result) => {
        serverResponse.sendSuccess(res, messages.SUCCESSFUL, result);
      })
      .catch((e) => {
        serverResponses.sendError(res, messages.BAD_REQUEST, e);
      });
  });

  router.get("/", (req, res) => {
    Todo.find({}, { __v: 0 })
      .then((todos) => {
        serverResponse.sendSuccess(res, messages.SUCCESSFUL, todos);
      })
      .catch((e) => {
        serverResponse.sendError(res, messages.BAD_REQUEST, e);
      });
  });*/