"use strict";

const async = require("async");
const fs = require("fs");
const Config = require("./Config");
const List = require("./List");
const Logging = require("./Logging");
const Task = require("./Task");
const Utility = require("./Utility");


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
      self.list = new List();
      for (let i in oldData) {
        let task = oldData[i];
        self.add(new Task(task.id, task.text, task.startTime, task.endTime, task.status));
      }
    }
    callback();
  });
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
    if (err) {
      Logging.logError(err, "TaskList.js", __STACK__[1].getLineNumber());
    }
    callback();
  });
}

TaskList.prototype.remove = function (taskObj) {
  this.list.remove(taskObj.id);
}

TaskList.prototype.removeAndStore = function (taskObj, callback) {
  this.remove(taskObj);
  this.removeFromStore(taskObj, function () {
    taskObj.delete();
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
        Logging.logError(err, "TaskList.js", __STACK__[1].getLineNumber());
        callback();
      } else {
        data = data.toString().replace(`${taskObj.id},`, "");

        fs.writeFile(filePathB, data, function (err) {
          if (err) {
            Logging.logError(err, "TaskList.js", __STACK__[1].getLineNumber());
          }
          callback();
        });
      }
    });
  }
}

TaskList.prototype.loadListByDate = function (date, callback) {
  let file = `${Config.TASK_STORE_DIR}/task_list.txt`;
  let time = date.toLocaleDateString();
  if (!fs.existsSync(file)) {
    typeof callback === "function" ? callback() : {};
  } else {
    fs.readFile(file, function (err, data) {
      if (err) {
        Logging.logError(err, "TaskList.js", __STACK__[1].getLineNumber());
        typeof callback === "function" ? callback() : {};
      } else {
        let list = data.toString().split(",");
        Config.Tasks = new TaskList();
        async.each(list, function (item, callback) {
          if (item != undefined && item.length > 0) {
            getTaskInfo(item, function (result) {
              if (new Date(parseInt(result.startTime)).toLocaleDateString() === time) {
                Config.Tasks.add(new Task(result.id, result.text, result.startTime, result.endTime, result.status));
              }
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

TaskList.prototype.loadList = function (callback) {
  let file = `${Config.TASK_STORE_DIR}/task_list.txt`;
  if (!fs.existsSync(file)) {
    typeof callback === "function" ? callback() : {};
  } else {
    fs.readFile(file, function (err, data) {
      if (err) {
        Logging.logError(err, "TaskList.js", __STACK__[1].getLineNumber());
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

TaskList.prototype.getAllTasks = function (container, callback) {
  let file = `${Config.TASK_STORE_DIR}/task_list.txt`;
  if (!fs.existsSync(file)) {
    typeof callback === "function" ? callback() : {};
  } else {
    fs.readFile(file, function (err, data) {
      if (err) {
        Logging.logError(err, "TaskList.js", __STACK__[1].getLineNumber());
        typeof callback === "function" ? callback() : {};
      } else {
        let list = data.toString().split(",");
        async.each(list, function (item, callback) {
          if (item != undefined && item.length > 0) {
            getTaskInfo(item, function (result) {
              container.add(result.id, new Task(result.id, result.text, result.startTime, result.endTime, result.status));
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

TaskList.prototype.searchAllTasks = function (val, callback) {
  let list = new List();
  let matchedTasks = [];
  Config.Tasks.getAllTasks(list, function () {
    list = list.toValueArray();
    for (let i = 0; i < list.length; i++) {
      if (Utility.subseq(list[i].text, val)) {
        matchedTasks.push(list[i]);
      }
    }
    callback(matchedTasks);
  });
}

/* Get the info of the task from the storage. */
function getTaskInfo(taskId, callback) {
  let file = `${Config.TASK_STORE_DIR}/${taskId}.txt`;
  fs.readFile(file, function (err, data) {
    if (err) {
      Logging.logError(err, "TaskList.js", __STACK__[1].getLineNumber());
      callback();
    } else {
      let info = JSON.parse(data);
      info["text"] = decodeURIComponent(info["text"]);
      callback(info);
    }
  });
}


module.exports = TaskList;
