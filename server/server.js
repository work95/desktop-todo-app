const async = require('async');
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const fs = require('fs');
const logger = require('tracer').colorConsole();
const request = require('request');

const app = express();

app.disable('x-powered-by');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const server = http.createServer(app);
server.listen(7910, function () {

  'use strict';
  logger.info("SERVER RUNNING AT 7910");
});

app.get('/poll', function (req, res) {

  'use strict';
  res.send({
    "activity": "up",
    "systemType": "station"
  });
});

/* Store the profile in the server's directory. */
app.post('/portProfile', function (req, res) {

  'use strict';
  let profile = req.body['profile'];
  if (!fs.existsSync('./user_list.txt')) {
    fs.writeFileSync('./user_list.txt', "");
  }

  let userList = fs.readFileSync('./user_list.txt').toString().split('\n');

  let userPresent = false;
  for (let i = 0; i < userList.length; i++) {
    if (profile['userInfo']['userId'] === userList[i]) {
      userPresent = true;
    }
  }

  if (!userPresent) {
    fs.appendFileSync('./user_list.txt', profile['userInfo']['userId'] + '\n');
  }
  fs.writeFileSync('./user_' + profile['userInfo']['userId'] + '.txt', JSON.stringify(profile));

  // SYNC with other servers.
  syncWithOtherServers();

  res.sendStatus(200);
});

/* Fetch the profile's information. */
app.post('/getProfile', function (req, res) {

  'use strict';
  res.send(fs.readFileSync('./user_' + req.body.userId + '.txt').toString());
});

/* Check if the user exists or not. */
app.post('/getUser', function (req, res) {

  'use strict';
  let userList = fs.readFileSync('./user_list.txt').toString().split('\n');
  userList.pop();
  let userId = "";

  async.each(userList, function (user, callback) {
    let userInfo = JSON.parse(fs.readFileSync('./user_' + user + '.txt').toString());
    if (userInfo['userInfo']['userEmail'] === req.body.userEmail) {
      callback(null);
      userId = user;
    } else {
      userId = "";
    }
  }, function (err, result) {
    if (userId === "") {
      res.send({
        "status": false
      });
    } else {
      res.send({
        "status": true,
        "userId": userId
      });
    }
  });
});

app.post('/sync', function (req, res) {
  let syncDetails = req.body;
  for (let i = 0; i < syncDetails['userList'].length; i++) {
    let userId = syncDetails['userList'][i];

    // If user with this ID does exists, just create one.
    if (!fs.existsSync('./user_' + userId + '.txt')) {
      fs.writeFileSync('./user_' + userId + '.txt', syncDetails['userInfo']);
      fs.appendFileSync('./user_list.txt', userId + '\n');
      return;
    }

    let userInfo = JSON.parse(fs.readFileSync('./user_' + userId + '.txt').toString());
    if (parseInt(userInfo['logTime']['portingTime']) < parseInt(JSON.parse(syncDetails['userInfo'][i])['logTime']['portingTime'])) {
      fs.writeFileSync('./user_' + userId + '.txt', syncDetails['userInfo']);
    }
  };
});

function syncWithOtherServers() {
  let servers = [
    'http://127.0.0.1:7911/', 'http://192.168.1.2:7910/', 'http://192.168.1.3:7910/', 'http://192.168.1.4:7910/', 
    'http://192.168.1.5:7910/', 'http://192.168.1.6:7910/', 'http://192.168.1.7:7910/', 'http://192.168.1.8:7910/'
  ];
  let availableServer = [];

  async.every(servers, function (serverUrl, callback) {
    sendRequest((serverUrl + 'poll'), 'GET', undefined, function (response) {
      if (response.activity === "up") {
        availableServer.push(serverUrl);
      }
      callback(null, true);
    });
  }, function (err, result) {
    if (availableServer.length < 0) { return; }
    
    // Create sync details.
    let syncDetails = {
      "userList": [],
      "userInfo": []
    };

    syncDetails['userList'] = fs.readFileSync('./user_list.txt').toString().split('\n');
    syncDetails['userList'].pop();

    for (let i = 0; i < syncDetails['userList'].length; i++) {
      syncDetails['userInfo'].push(fs.readFileSync('./user_' + syncDetails['userList'][i] + '.txt').toString());
    }
    
    for (let i = 0; i < availableServer.length; i++) {
      sendRequest((availableServer[i] + 'sync'), 'POST', syncDetails, function (resp) {
        logger.info(resp);
      });
    }
  });
}

function sendRequest(url, method, bodyContent, callback) {
  let options = {
    "uri": url,
    "method": method,
    "headers": {
      "content-type": 'application/json'
    },
    "body": JSON.stringify(bodyContent)
  };

  request(options, function (err, response, body) {
    if (err) {
      logger.warn('[Error]: ' + err);
      callback({ "activity": "down" });
    } else {
      callback(JSON.parse(body));
    }
  });
}
