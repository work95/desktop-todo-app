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

TaskList.prototype.getTask = function (taskId) {
  return this.list.get(taskId);
}

TaskList.prototype.getKeys = function () {
  return this.list.toKeyArray();
}

TaskList.prototype.getTasks = function () {
  return this.list.toValueArray();
}

TaskList.prototype.add = function (taskObj) {
  this.list.add(taskObj.id, taskObj);
}

TaskList.prototype.addTask = function (taskObj, callback) {
  this.add(taskObj);
  this.store(() => callback());
}

TaskList.prototype.store = function (callback) {
  fs.writeFile(`${Config.TASK_STORE_DIR}/mainStore.json`, JSON.stringify(this), (err) => {
    if (err) {
      Logging.logError(err, "TaskList.js", __STACK__[1].getLineNumber());
    }
    callback();
  });
}

TaskList.prototype.load = function (callback) {
  fs.readFile(`${Config.TASK_STORE_DIR}/mainStore.json`, (err, data) => {
    if (err) {
      Logging.logError(err, "TaskList.js", __STACK__[1].getLineNumber());
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

TaskList.prototype.remove = function (taskObj) {
  this.list.remove(taskObj.id);
}

TaskList.prototype.removeTask = function (taskObj, callback) {
  this.remove(taskObj);
  this.store(() => callback());
}

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

TaskList.prototype.searchTask = function (val) {
  let list = Config.Tasks.getTasks();
  let matchedTasks = [];
  for (let i = 0; i < list.length; i++) {
    if (Utility.subseq(list[i].text, val)) {
      matchedTasks.push(list[i]);
    }
  }

  return matchedTasks;
}

TaskList.prototype.searchAllTasks = function (val) {
  let matchedTasks = [];
  let list = Config.Tasks.getTasks();
  for (let i = 0; i < list.length; i++) {
    if (Utility.subseq(list[i].text, val)) {
      matchedTasks.push(list[i]);
    }
  }
}

TaskList.prototype.updateTaskStatus = function (taskId, status) {
  this.getTask(taskId).status = status;
  this.store(() => {});
}

/* Add time constraint on the task. */
TaskList.prototype.addTaskTimeLimit = function (taskId, endTime) {
  this.getTask(taskId).endTime = endTime;
  this.store(() => {});
}

module.exports = TaskList;
