"use strict";

const fs = require('fs');
const Config = require("./Config");
const NotificationHandler = require("./notification_handler");
const TaskHandler = require("./task_handler");
const UiIndex = require("./ui_index");

const IndexMain = module.exports = {

  /* Check the storage directory structure. */
  checkDirectoryStructure: function () {
    // Parent storage directory.
    let mainDir = `./data-store/`;
    
    if (!fs.existsSync(mainDir)) { fs.mkdirSync(mainDir); }
  },

  /* Load the User Id of the last logged in user or use default user. */
  loadUserId: function () {
    let userDir = `./data-store/user-store/`;
    let userFile = `${userDir}/last_login.txt`;

    if (!fs.existsSync(userDir)) { 
      fs.mkdirSync(userDir);
      fs.writeFileSync(userFile, "");
      return null;
    }

    // Create or read and return.
    if (!fs.existsSync(userFile)) { 
      fs.writeFileSync(userFile, ""); 
    } else {
      return fs.readFileSync(userFile).toString();
    }
  },

  /* Main entry point of the application. */
  init: function () {
    // Check directory structure.
    IndexMain.checkDirectoryStructure();

    // Load USER_ID.
    Config.USER_ID = IndexMain.loadUserId() || "user_0";

    // Attach window key listeners.
    UiIndex.attachWindowKeyListener();

    TaskHandler.loadTaskList(function () {
      UiIndex.displayTaskList(function () {

        // Keep on checking for notifications.
        setInterval(function () {
          NotificationHandler.checkNotifications();
        }, 5000);

        // Keep on ticking the timer on the time constrained tasks.
        setInterval(function () {
          UiIndex.setTaskTimeLeft();
        }, 3000);
      });
    });
  }
};
