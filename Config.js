"use strict";

const List = require("./List");

var TASK_LIST = new List();
var USER_ID = "user_0";

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
  KeyCodes
};
