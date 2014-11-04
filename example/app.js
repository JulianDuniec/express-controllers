var express             = require('express');
var expressController   = require('express-controller');
var http                = require('http');

var port = '4040';


// Create the express-app
var app = express();

//Create routing
expressController
    .setDirectory(__dirname + '/controllers')
    .bind(app);

//Start a http-server and listen to the port
http.createServer(app).listen(port).listen(function() {
    console.log('Now running at localhost:'+port);
});