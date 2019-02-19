"use strict";

const fs = require('fs');
const Config = require("./Config");
const NotificationHandler = require("./notification_handler");
const TaskList = require("./TaskList");
const UiIndex = require("./ui_index");

const IndexMain = module.exports = {

  /* Check the storage directory structure. */
  checkDirectoryStructure: function () {
    // Parent storage directory.    
    if (!fs.existsSync(Config.BASE_STORE_DIR)) { fs.mkdirSync(Config.BASE_STORE_DIR); }
  },

  checkUserDirectoryStructure: function () {
    if (!fs.existsSync(Config.USER_STORE_DIR + "/" + Config.USER_ID)) {
      fs.mkdirSync(Config.USER_STORE_DIR + "/" + Config.USER_ID);
    }
  },

  /* Load the User Id of the last logged in user or use default user. */
  loadLastUserId: function () {
    if (!fs.existsSync(Config.USER_STORE_DIR)) { 
      fs.mkdirSync(Config.USER_STORE_DIR);
      fs.writeFileSync(Config.LAST_LOGIN_FILE, "");
      return null;
    }

    // Create or read and return.
    if (!fs.existsSync(Config.LAST_LOGIN_FILE)) { 
      fs.writeFileSync(Config.LAST_LOGIN_FILE, ""); 
    } else {
      return fs.readFileSync(Config.LAST_LOGIN_FILE).toString();
    }
  },

  /* Main entry point of the application. */
  init: function () {
    // Check directory structure.
    IndexMain.checkDirectoryStructure();

    // Load USER_ID.
    Config.USER_ID = IndexMain.loadLastUserId() || "user_0";

    // Check if the user's directory is okay.
    IndexMain.checkUserDirectoryStructure();

    // Load configuration variables.
    Config.setupConfiguration();

    // Initialize the TaskList
    Config.Tasks = new TaskList();

    // Attach window key listeners.
    UiIndex.attachWindowKeyListener();

    // Load the Tasks (TaskList).
    Config.Tasks.loadList(function () {
      // Display the tasks.
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
