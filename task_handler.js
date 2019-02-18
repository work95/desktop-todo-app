"use strict";

const async = require("async");
const fs = require("fs");
const Config = require("./Config");

const TaskHandler = module.exports = {
  /* To add the task in the list. */
  addTask: function (taskId, taskText, callback) {
    let date;
    if (taskId == undefined) {
      date = new Date().getTime();
      taskId = `task_${date}`;
    } else {
      date = taskId.substring(5);
    }

    let taskInfo = {
      "taskId": taskId,
      "taskStatus": false,
      "taskStartTime": date,
      "taskEndTime": null,
      "taskText": encodeURIComponent(taskText),
    };
    Config.TASK_LIST.add(taskId, taskInfo);
    TaskHandler.addTaskInStore(taskInfo, function (result) {
      typeof callback === "function" ? callback() : {};
    });
  },

  /* Add the task in record. */
  addTaskInStore: function (taskInfo, callback) {
    let filePath = `./data-store/user-store/${Config.USER_ID}/task-store-dir/`;
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
    fs.appendFile(`${filePath}/task_list.txt`, `${taskInfo["taskId"]},`, function (err) {
      fs.writeFile(`${filePath}/${taskInfo["taskId"]}.txt`, JSON.stringify(taskInfo), function (err) {
        typeof callback === "function" ? callback() : {};
      });
    });
  },

  /* Update the completion status of the task. */
  updateTaskCompleteInStore: function (taskId, status, callback) {
    let filePath = `./data-store/user-store/${Config.USER_ID}/task-store-dir/`;
    let taskInfo = Config.TASK_LIST.get(taskId);
    taskInfo["taskStatus"] = status;
    fs.writeFile(`${filePath}/${taskId}.txt`, JSON.stringify(taskInfo), function (err) {
      typeof callback === "function" ? callback() : {};
    });
  },

  /* Add time constraint on the task. */
  addTaskTimeLimit: function (taskId, endTime) {
    let filePath = './data-store/user-store/' + Config.USER_ID + '/task-store-dir/';
    let taskInfo = Config.TASK_LIST.get(taskId);
    taskInfo["taskEndTime"] = endTime;

    fs.writeFile(`${filePath}/${taskId}.txt`, JSON.stringify(taskInfo), function (err) {
      if (err) {
        /* LOG ERROR. */
        console.log(err);
      }
    });
  },

  /* Delete the task from the record. */
  deleteTaskFromStore: function (taskId, callback) {
    let filePathA = `./data-store/user-store/${Config.USER_ID}/task-store-dir`;
    let filePathB = `${filePathA}/task_list.txt`;
    console.log(filePathB);

    if (!fs.existsSync(filePathB)) {
      typeof callback === "function" ? callback() : {};
      return;
    } else {
      fs.readFile(filePathB, function (err, data) {
        if (err) {
          // Log the error.
          console.log(err);
        } else {
          data = data.toString().replace(`${taskId},`, "");
    
          fs.writeFile(filePathB, data, function (err) {
            if (err) {
              console.log(err);
              typeof callback === "function" ? callback() : {};
            } else {
              fs.unlinkSync(`${filePathA}/${taskId}.txt`);
              Config.TASK_LIST.remove(taskId);
              typeof callback === "function" ? callback() : {};
            }
          });
        }
      });
    }
  },  

  /* Get the info of the task from the storage. */
  getTaskInfo: function (taskId, callback) {
    let file = `./data-store/user-store/${Config.USER_ID}/task-store-dir/${taskId}.txt`;
    fs.readFile(file, function (err, data) {
      if (err) {
        // Log the error.
        console.log(err);
        callback();
      } else {
        let info = JSON.parse(data);
        info["taskText"] = decodeURIComponent(info["taskText"]);
        callback(info);
      }
    });
  },

  /* Load the task list into the JSON. */
  loadTaskList: function (callback) {
    let file = `./data-store/user-store/${Config.USER_ID}/task-store-dir/task_list.txt`;
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
              TaskHandler.getTaskInfo(item, function (result) {
                Config.TASK_LIST.add(item, result);
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
  },

  /* HTML template for task. */
  getTaskTemplate: function (taskId, taskText, date, endTime) {
    date = new Date(parseInt(date));
    let taskNode = '<li class="list-group-item" id="' + taskId + '" status="false">' +
      '<span id="task-complete-icon"><i class="fa fa-check"></i></span>' +
      '<span class="task-text">' + taskText + '<br />' +
      '<span class="task-start-date">' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + '</span>' +
      '<span class="task-end-time"></span>' +
      '</span>' +
      '<div class="task-options-cont">' +
      '<div class="dot-set dropdown" id="dropdownMenu2" data-toggle="dropdown" aria-expanded="false">' +
      '<span class="dot"></span>' +
      '<span class="dot"></span>' +
      '<span class="dot"></span>' +
      '</div>' +
      '<div id="task-options-menu" class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu2">' +
      '<a class="complete-task-btn" state="false" class="dropdown-item" href="#">' +
      '<span><i class="fa fa-check"></i></span>Task Complete' +
      '</a>' +
      '<a class="delete-task-btn" class="dropdown-item" href="#">' +
      '<span><i class="fa fa-trash-alt"></i></span>Delete Task' +
      '</a>' +
      '<a class="add-time-limit-btn" task-id="" class="dropdown-item" data-toggle="modal" data-target="#task-time-limit-cont" href="#">' +
      '<span><i class="fa fa-clock"></i></span>Add Time Limit' +
      '</a>'
    '</div>' +
      '</div>' +
      '</li>';

    return taskNode;
  }
};
