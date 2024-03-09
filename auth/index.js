require('dotenv').config();
console.log(process.env);

const express = require('express');
const http = require('node:http');
const bodyParser = require('body-parser');
const db = require("./db");
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
//app.use(express.static(__dirname + '/static'));

db.connect(app);
const { producer } = db.connectKafka(app);

//const fs = require("fs");
//const privateKey = fs.readFileSync( 'private.key' );
//const certificate = fs.readFileSync( 'SSL.crt' );

const server_config = {
  //key : privateKey,
  //cert: certificate
};

require("./routes")(app, producer);

app.on("ready", () => {
	const server = http.createServer(server_config, app);
	server.listen(process.env.PORT, (err) => {
		if (err)
			console.log(err);
		else
			console.log(`Auth service is on port ${process.env.PORT}`);
	});
});

//const get = require('./routes/get');
//const authorize = require('./routes/authorize');
//const verify = require('./routes/verify');
//app.get('/', get);
//app.post('/authorize', authorize);
//app.post('/verify', verify);
