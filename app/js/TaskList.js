"use strict";

const fs = require("fs");
const Config = require("./Config");
const List = require("./List");
const Logging = require("./Logging");
const Task = require("./Task");
const Utility = require("./Utility");


function TaskList() {
  this.list = new List();
};

/**
 * Get the Task object to corresponding @param taskId.
 */
TaskList.prototype.getTask = function (taskId) {
  return this.list.get(taskId);
}

/**
 * Get an array of all the Tasks' 'id'.
 */
TaskList.prototype.getKeys = function () {
  return this.list.toKeyArray();
}

/**
 * Get an array of all the Task objects.
 */
TaskList.prototype.getTasks = function () {
  return this.list.toValueArray();
}

/**
 * Add task @param taskObj in TaskList.
 */
TaskList.prototype.add = function (task) {
  this.list.add(task.id, task);
}

/**
 * Add task @param task in TaskList and storage too.
 */
TaskList.prototype.addTask = function (task, callback) {
  this.add(task);
  this.store(() => callback());
}

/**
 * Serialize the TaskList object.
 */
TaskList.prototype.store = function (callback) {
  fs.writeFile(Config.TASK_STORAGE_FILE, JSON.stringify(this), (err) => {
    if (err) {
      Logging.logError(err, "TaskList.js");
    }
    callback();
  });
}

/**
 * Deserialize the TaskList object.
 */
TaskList.prototype.load = function (callback) {
  fs.readFile(Config.TASK_STORAGE_FILE, (err, data) => {
    if (err) {
      Logging.logError(err, "TaskList.js");
    } else {
      let self = this;
      let oldData = JSON.parse(data).list.container;
      for (let i in oldData) {
        let task = oldData[i];
        self.add(new Task(task.id, task.text, task.startTime, task.endTime, task.status));
      }
    }
    callback();
  });
}

/**
 * Remove the task from TaskList.
 */
TaskList.prototype.remove = function (taskObj) {
  this.list.remove(taskObj.id);
}

/**
 * Remove the task from TaskList and storage too.
 */
TaskList.prototype.removeTask = function (taskObj, callback) {
  this.remove(taskObj);
  this.store(() => callback());
}

/**
 * Returns the list of tasks filtered by the given date.
 */
TaskList.prototype.getTasksByDate = function (date) {
  let list = this.getTasks();
  let time = date.toLocaleDateString();
  let taskList = [];
  for (let i = 0; i < list.length; i++) {
    if (new Date(list[i].startTime).toLocaleDateString() === time) {
      taskList.push(list[i]);
    }
  }

  return taskList;
}

/**
 * Searches for task in the current time pane. 
 */
TaskList.prototype.searchTask = function (val) {
  // Fetch the tasks for the date of the current pane.
  let list = Config.Tasks.getTasksByDate(Config.CurrentDate);
  return list.filter((task) => Utility.subseq(task.text, val));
}

/**
 * Searches for all tasks. 
 */
TaskList.prototype.searchAllTasks = function (val) {
  return Config.Tasks.getTasks().filter((task) => Utility.subseq(task.text, val));
}

/** 
 * Update the status of the task. 
 */
TaskList.prototype.updateTaskStatus = function (taskId, status) {
  this.getTask(taskId).status = status;
  this.store(() => {});
}

/** 
 * Add time constraint on the task. 
 */
TaskList.prototype.addTaskTimeLimit = function (taskId, endTime) {
  this.getTask(taskId).endTime = endTime;
  this.store(() => {});
}

module.exports = TaskList;
