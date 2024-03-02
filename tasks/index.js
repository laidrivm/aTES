const express = require('express');
const app = express();
const http = require('node:http');

const server_config = {
  //key : privateKey,
  //cert: certificate
};
const port = 3002;
const server = http.createServer(server_config, app);

server.listen(port, (err) => {
  console.log(`Node.js Express Server running on ${port}/`);
});

