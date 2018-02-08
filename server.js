var bodyParser = require('body-parser');
var express = require('express');
var http = require('http');
var fs = require('fs');

var commonModules = require('./common_modules');

var app = express();

app.disable('x-powered-by');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var server = http.createServer(app);
server.listen(7910, function () {
  'use strict';
  commonModules.logger.info("SERVER RUNNING AT 7910");
});

/* Complete profile (all tasks (project, normal), notes). */
app.post('/portProfile', function (req, res) {
  var profile = req.body;
  fs.writeFileSync('user_' + profile['userInfo']['userId'] + '.txt', JSON.stringify(profile));
  
  res.sendStatus(200);
});

app.post('/getProfile', function (req, res) {
  res.send(fs.readFileSync('./user_' + req.body.userId + '.txt').toString());
});
