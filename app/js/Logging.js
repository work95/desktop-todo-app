"use strict";

const fs = require("fs");
const Config = require("./Config");

module.exports = {
  logError: function (message, moduleName) {
    let logMessage = `[${new Date().toLocaleString()} (${moduleName}:${__STACK__[2].getLineNumber()})] ${message}\n`;
    fs.appendFileSync(Config.LOG_FILE, logMessage);
  }
};
