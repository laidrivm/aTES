const mongoose = require("mongoose");

exports.connect = (app) => {
  const options = {
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10 // Maintain up to 10 socket connections
  };

  const connectWithRetry = () => {
    mongoose.Promise = global.Promise;
    console.log(`Tasks service is trying to connect with retry to MongoDB ${process.env.MONGODB_URI}`);
    mongoose
      .connect(process.env.MONGODB_URI, options)
      .then(() => {
        console.log(`Tasks service is connected to MongoDB`);
        app.emit("ready");
      })
      .catch((err) => {
        console.log("Tasks service's connection to MongoDB is unsuccessful, retry after 2 seconds.", err);
        setTimeout(connectWithRetry, 2000);
      });
  };
  connectWithRetry();
};