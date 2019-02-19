"use strict";

const env = require("dotenv").config();
const List = require("./List");

var TASK_LIST = new List();
var USER_ID = "user_0";

var SHOWN_NOTIFICATIONS = [];
var NOTIFICATION_COUNT = 0;

const BASE_STORE_DIR = process.env.BASE_STORE_DIR;
const USER_STORE_DIR = process.env.USER_STORE_DIR;
const LAST_LOGIN_FILE = process.env.LAST_LOGIN_FILE;
var TASK_STORE_DIR = process.env.TASK_STORE_DIR;

var Tasks;

/* Common key codes. */
const KeyCodes = {
  "ESCAPE": 27,
  "CONTROL": 17,
  "SHIFT": 16,
  "ALT": 18,
  "ENTER": 13
};

const Config = module.exports = {
  TASK_LIST,
  Tasks,
  USER_ID,
  SHOWN_NOTIFICATIONS,
  NOTIFICATION_COUNT,
  KeyCodes,
  LAST_LOGIN_FILE,
  BASE_STORE_DIR,
  USER_STORE_DIR,
  TASK_STORE_DIR,

  setupConfiguration: function () {
    Config.TASK_STORE_DIR = `${Config.USER_STORE_DIR}/${Config.USER_ID}/${Config.TASK_STORE_DIR}`;
  }
};
