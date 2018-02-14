const fs = require('fs');

function logError(message) {

  // Check for existence of 'logs' directory.
  if (!fs.existsSync('./logs/')) {
    fs.mkdirSync('./logs/');
  }
  
  let date = new Date();
  let dateFile = (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear();

  message = '[' + new Date() + ']:  ' + message;
  fs.appendFileSync('./logs/' + dateFile + '.txt', message + '\n');
  
  $('#log-error-cont').fadeIn();
  setTimeout(function () {
    $('#log-error-cont').addClass('fadeOutRight');
    $('#log-error-cont').fadeOut();
  }, 5000);
}

module.exports.logError = logError;
