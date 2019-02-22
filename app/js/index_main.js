"use strict";

const fs = require('fs');
const Config = require("./Config");
const TaskList = require("./TaskList");
const UiIndex = require("./ui_index");

const IndexMain = module.exports = {

  /* Check the storage directory structure. */
  checkDirectoryStructure: function () {
    // Parent storage directory.    
    if (!fs.existsSync(Config.BASE_STORE_DIR)) { fs.mkdirSync(Config.BASE_STORE_DIR); }
    if (!fs.existsSync(Config.LOG_DIR)) { fs.mkdirSync(Config.LOG_DIR); }
  },

  checkUserDirectoryStructure: function () {
    // Check user's directory.
    if (!fs.existsSync(Config.USER_DIR)) { fs.mkdirSync(Config.USER_DIR); }
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
    // Load configuration variables.
    Config.setupConfiguration();
    // Check if the user's directory is okay.
    IndexMain.checkUserDirectoryStructure();
    // Initialize the TaskList
    Config.Tasks = new TaskList();
    // Attach window key listeners.
    UiIndex.attachWindowKeyListener();
    // Load the Tasks (TaskList).
    Config.Tasks.loadList(function () {
      // Display the tasks.
      UiIndex.displayTaskList(function () {});
    });
  }
};
