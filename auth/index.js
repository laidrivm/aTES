const express = require('express');
const app = express();
const http = require('node:http');
//const fs = require("fs");
//const bodyParser = require('body-parser');
//const get = require('./routes/get');
//const authorize = require('./routes/authorize');
//const verify = require('./routes/verify');

//require('dotenv').config();

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
const server_config = {
	//key : privateKey,
	//cert: certificate
};
const port = 3001;
const server = http.createServer(server_config, app);

server.listen(port, (err) => {
	console.log(`Node.js Express Server running on ${port}/`);
});


