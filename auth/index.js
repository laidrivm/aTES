require('dotenv').config();
console.log(process.env);

const express = require('express');
const http = require('node:http');
const bodyParser = require('body-parser');
const db = require("./db");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

db.connect(app);

const server_config = {
	//key : privateKey,
	//cert: certificate
};

app.on("ready", () => {
	const server = http.createServer(server_config, app);
	server.listen(process.env.PORT, (err) => {
		if (err)
			console.log(err);
		else
			console.log(`Node.js Express Server is on port ${process.env.PORT}`);
	});
});

//const fs = require("fs");
//const get = require('./routes/get');
//const authorize = require('./routes/authorize');
//const verify = require('./routes/verify');

//if (!process.env.MONGO_CONNECTION) {
//    console.error("MONGO_CONNECTION environment variable is not set.");
//    process.exit(1);
//}

//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.static(__dirname + '/static'));

//app.get('/', get);
//app.post('/authorize', authorize);
//app.post('/verify', verify);

//const privateKey = fs.readFileSync( 'private.key' );
//const certificate = fs.readFileSync( 'SSL.crt' );