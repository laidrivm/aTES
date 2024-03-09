const express = require("express");
//const serverResponse = require("./responses");
//const messages = require("../config/messages");
const User = require("../db/user");
const jwt = require('jsonwebtoken');
const { Kafka } = require('kafkajs');

const routes = (app, producer) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
        // Retrieve all records from the clients collection
        const users = await User.find({}, { _id: 1, client_id: 1, client_secret: 1 });
        
        res.json(users);
    } catch (error) {
        // Handle errors
        console.error("Error retrieving tokens:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/authenticate", async (req, res) => {
    try {
        const { user_id, user_secret } = req.body;
        // Todo: add hash here

        // Check if this user already exists for the given user_id and user_secret
        let user = await User.findOne({ user_id, user_secret });

        // If no user found, create a new one
        if (!user) {
            user = new User({ user_id, user_secret, role: "doer" });

            await user.save();

            // Maybe should JSON.stringify() values
            await producer.send({
              topic: 'user.cud',
              messages: [{
                properties: {
                  event_id: '',
                  event_version: 1,
                  event_name: 'user.created',
                  event_time: '',
                  producer: 'auth'
                },
                data: {
                  user_id: user.user_id,
                  user_role: user.user_role
                }
              }]
            });
        }

        // Create a JWT token
        const jwtPayload = { user_id: user.user_id, role: user.role };
        const jwtToken = jwt.sign(jwtPayload, process.env.SECRET);

        res.json({ token: jwtToken });
    } catch (error) {
        console.error("Error authenticating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/verify", async (req, res) => {
    try {
        // Extract the token from the request headers
        //const token = req.headers.authorization;

        const { token } = req.body;

        // Decode the token to verify
        const decoded = jwt.verify(token, process.env.SECRET);

        // Send the decoded token to the client
        res.json(decoded);
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).json({ error: "Unauthorized" });
    }
  });

  router.post("/authorize", (req, res) => {

  });

  app.use("/", router);
};

module.exports = routes;
