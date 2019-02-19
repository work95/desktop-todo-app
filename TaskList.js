"use strict";

const async = require("async");
const fs = require("fs");
const Config = require("./Config");
const List = require("./List");
const Task = require("./Task");


function TaskList() {
  this.list = new List();
};

TaskList.prototype.getKeys = function () {
  return this.list.toKeyArray();
}

TaskList.prototype.getTask = function (taskId) {
  return this.list.get(taskId);
}

TaskList.prototype.getTasks = function () {
  return this.list.toValueArray();
}

TaskList.prototype.add = function (taskObj) {
  this.list.add(taskObj.id, taskObj);
}

TaskList.prototype.addAndStore = function (taskObj, callback) {
  this.add(taskObj);
  this.addInStore(taskObj, function () {
    callback();
  });
}

TaskList.prototype.addInStore = function (taskObj, callback) {
  let file = Config.TASK_STORE_DIR;
  if (!fs.existsSync(file)) { fs.mkdirSync(file); }
  fs.appendFile(`${file}/task_list.txt`, `${taskObj.id},`, function (err) {
    callback();
  });
}

TaskList.prototype.remove = function (taskObj) {
  this.list.remove(taskObj.id);
}

TaskList.prototype.removeAndStore = function (taskObj, callback) {
  this.remove(taskObj);
  this.removeFromStore(taskObj, function () {
    callback();
  });
}

TaskList.prototype.removeFromStore = function (taskObj, callback) {
  let filePathA = Config.TASK_STORE_DIR;
  let filePathB = `${filePathA}/task_list.txt`;

  if (!fs.existsSync(filePathB)) {
    callback();
  } else {
    fs.readFile(filePathB, function (err, data) {
      if (err) {
        // Log the error.
        console.log(err);
        callback();
      } else {
        data = data.toString().replace(`${taskObj.id},`, "");

        fs.writeFile(filePathB, data, function (err) {
          if (err) {
            console.log(err);
          }
          callback();
        });
      }
    });
  }
}

TaskList.prototype.loadList = function (callback) {
  let file = `${Config.TASK_STORE_DIR}/task_list.txt`;
  if (!fs.existsSync(file)) {
    typeof callback === "function" ? callback() : {};
  } else {
    fs.readFile(file, function (err, data) {
      if (err) {
        // Log the error.
        console.log(err);
        typeof callback === "function" ? callback() : {};
      } else {
        let list = data.toString().split(",");
        async.each(list, function (item, callback) {
          if (item != undefined && item.length > 0) {
            getTaskInfo(item, function (result) {
              Config.Tasks.add(new Task(result.id, result.text, result.startTime, result.endTime, result.status));
              callback();
            });
          } else {
            callback();
          }
        }, function (err) {
          typeof callback === "function" ? callback() : {};
        });
      }
    });
  }
}

/* Get the info of the task from the storage. */
function getTaskInfo(taskId, callback) {
  let file = `${Config.TASK_STORE_DIR}/${taskId}.txt`;
  fs.readFile(file, function (err, data) {
    if (err) {
      // Log the error.
      console.log(err);
      callback();
    } else {
      let info = JSON.parse(data);
      info["text"] = decodeURIComponent(info["text"]);
      callback(info);
    }
  });
}


module.exports = TaskList;
