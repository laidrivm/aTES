require('dotenv').config();
console.log(process.env);

const express = require('express');
const http = require('node:http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const db = require("./db");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
//app.use(express.static(__dirname + '/static'));

db.connect(app);

//const fs = require("fs");
//const privateKey = fs.readFileSync( 'private.key' );
//const certificate = fs.readFileSync( 'SSL.crt' );

const server_config = {
  //key : privateKey,
  //cert: certificate
};

require("./routes")(app);

app.on("ready", () => {
  const server = http.createServer(server_config, app);
  server.listen(process.env.PORT, (err) => {
    if (err)
      console.log(err);
    else
      console.log(`Tasks service is on port ${process.env.PORT}`);
  });
});

