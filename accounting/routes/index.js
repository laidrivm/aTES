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
    const usersWithNegativeBalance = await User.find({ balance: { $lt: 0 } });

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
      popugsInDebt: usersWithNegativeBalance.length,
      transactions
    });
  });

  router.get("/tasks", async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);

    const weekAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 7);

    const resultToday = await Task.aggregate([
      { $match: { created_at: { $gte: today } } },
      { $group: { _id: null, maxCompletedPrice: { $max: "$completed_price" } } }
    ]);

    const resultWeek = await Task.aggregate([
    { $match: { created_at: { $gte: weekAgo } } },
      { $group: { _id: null, maxCompletedPrice: { $max: "$completed_price" } } }
    ]);

    const resultMonth = await Task.aggregate([
      { $match: { created_at: { $gte: monthAgo } } },
      { $group: { _id: null, maxCompletedPrice: { $max: "$completed_price" } } }
    ]);

    const statsMonth = await Task.aggregate([
      { $match: { created_at: { $gte: monthAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } }, maxCompletedPrice: { $max: "$completed_price" } } },
      { $sort: { '_id': 1 } }
    ]);

    res.json({ resultToday, resultWeek, resultMonth, statsMonth });
  });

  router.get("/transactions", async (req, res) => {
    const transactions = await Transaction.find({});
    res.json(transactions);
  });

  app.use("/", router);
};

module.exports = routes;