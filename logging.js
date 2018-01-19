var fs = require('fs');

function logError(message) {

  // Check for existence of 'logs' directory.
  if (!fs.existsSync('./logs/')) {
    fs.mkdirSync('./logs/');
  }
  
  var date = new Date();
  var dateFile = (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear();

  message = '[' + new Date() + ']:  ' + message;
  fs.appendFileSync('./logs/' + dateFile + '.txt', message + '\n');
}

module.exports.logError = logError;
