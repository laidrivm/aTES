const express = require("express");
const Task = require("../db/task");
const User = require("../db/user");
const Transaction = require("../db/transaction");
const checkToken = require('../middlewares/checktoken');

const routes = (app, producer) => {
  const router = express.Router();

  router.use(checkToken);

  router.get("/", async (req, res) => {
    const user = await User.find({ user_id: req.user.user_id });
    const transactions = await Transaction.find({ account_id: req.user.user_id });
    res.json({
      balance: user[0].balance,
      transactions
    });
  });

  router.get("/admin", async (req, res) => {
    const transactions = await Transaction.find({});
    let earned = 0;
    transactions.forEach(transaction => {
      if (transaction.type === "debit") {
        earned -= transaction.amount;
      } else {
        earned += transaction.amount;
      }
    });
    res.json({
      earned,
      transactions
    });
  });

  router.get("/transactions", async (req, res) => {
    const transactions = await Transaction.find({});
    res.json(transactions);
  });

  app.use("/", router);
};

module.exports = routes;