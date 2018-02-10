const async = require('async');
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const fs = require('fs');
const logger = require('tracer').colorConsole();

var app = express();

app.disable('x-powered-by');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var server = http.createServer(app);
server.listen(7910, function () {

  'use strict';
  logger.info("SERVER RUNNING AT 7910");
});

app.get('/poll', function (req, res) {
  res.send({
    "activity": "up",
    "systemType": "station"
  });
});

/* Store the profile in the server's directory. */
app.post('/portProfile', function (req, res) {
  var profile = req.body;
  fs.writeFileSync('./user_' + profile['userInfo']['userId'] + '.txt', JSON.stringify(profile));
  fs.appendFileSync('./user_list.txt', profile['userInfo']['userId'] + '\n');
  
  res.sendStatus(200);
});

/* Fetch the profile's information. */
app.post('/getProfile', function (req, res) {
  res.send(fs.readFileSync('./user_' + req.body.userId + '.txt').toString());
});

/* Check if the user exists or not. */
app.post('/getUser', function (req, res) {
  var userList = fs.readFileSync('./user_list.txt').toString().split('\n');
  userList.pop();
  let userId = "";

  async.each(userList, function (user, callback) {
    var userInfo = JSON.parse(fs.readFileSync('./user_' + user + '.txt').toString());
    if (userInfo['userInfo']['userEmail'] === req.body.userEmail) {
      callback(null);
      userId = user;
    } else {
      userId = "";
    }
  }, function (err, result) {
    console.log(err, result);
    if (userId === "") {
      res.sendStatus(404);
    } else {
      res.send(JSON.stringify({
        "userId": userId
      }));
    }
  });
});
