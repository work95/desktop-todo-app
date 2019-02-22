"use strict";

const env = require("dotenv").config();

/* 
 * Directory variables. 
 */

/* Parent directory of the whole storage. */
const BASE_STORE_DIR = process.env.BASE_STORE_DIR;

/* User's base directory, where all the user's are stored. */
const USER_STORE_DIR = process.env.USER_STORE_DIR;

/* Where the last login file is stored. */
const LAST_LOGIN_FILE = process.env.LAST_LOGIN_FILE;

/* Logging dir. */
const LOG_DIR = process.env.LOG_DIR;

/* Logging file. */
const LOG_FILE = process.env.LOG_FILE;


/* 
 * Updated after USER_ID is set. That is why they are not constants. 
 */

/* Task storage directory of the current user. */
var TASK_STORE_DIR = process.env.TASK_STORE_DIR;

/* Current user's storage directory. */
var USER_DIR = process.env.USER_STORE_DIR;

/* Stores the Interval handle for various timers applied to time constrained tasks. */
var Timers = {};

/* Task List object. */
var Tasks;

/* Current user's ID. This value is public. */
var USER_ID = "user_0";

/* Common key codes. */
const KeyCodes = {
  "ESCAPE": 27,
  "CONTROL": 17,
  "SHIFT": 16,
  "ALT": 18,
  "ENTER": 13
};

const Config = module.exports = {
  Timers,
  Tasks,
  USER_ID,
  KeyCodes,
  LAST_LOGIN_FILE,
  BASE_STORE_DIR,
  USER_STORE_DIR,
  LOG_DIR,
  LOG_FILE,
  TASK_STORE_DIR,
  USER_DIR,

  setupConfiguration: function () {
    Config.TASK_STORE_DIR = `${Config.USER_STORE_DIR}/${Config.USER_ID}/${Config.TASK_STORE_DIR}`;
    Config.USER_DIR = `${Config.USER_DIR}/${Config.USER_ID}`;
  }
};
