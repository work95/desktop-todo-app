"use strict";

const List = require("./List");

var TASK_LIST = new List();
var USER_ID = "user_0";

var SHOWN_NOTIFICATIONS = [];
var NOTIFICATION_COUNT = 0;

/* Common key codes. */
const KeyCodes = {
  "ESCAPE": 27,
  "CONTROL": 17,
  "SHIFT": 16,
  "ALT": 18,
  "ENTER": 13
};

module.exports = {
  TASK_LIST,
  USER_ID,
  SHOWN_NOTIFICATIONS,
  NOTIFICATION_COUNT,
  KeyCodes
};
