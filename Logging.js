"use strict";

const fs = require("fs");
const Config = require("./Config");

module.exports = {
  logError: function (message, moduleName, lineNumber) {
    let logMessage = '[' + new Date().toLocaleString() + " (" + moduleName + ":" + lineNumber + ")] " + message + "\n";
    fs.appendFileSync(Config.LOG_FILE, logMessage);
  }
};
