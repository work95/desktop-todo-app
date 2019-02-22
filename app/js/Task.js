"use strict";

const fs = require("fs");
const Config = require("./Config");
const Logging = require("./Logging");

function Task(id, text, startTime, endTime, status) {
  let self = this;

  // For ID and time purpose.
  let time = new Date().getTime();

  self.id = id || `task_${time}` ;
  self.text = text || "";
  self.startTime = startTime || time;
  self.endTime = endTime || null;
  self.status = status || false;
};

Task.prototype.save = function (callback) {
  Config.Tasks.add(this);
  this.store(function () {
    typeof callback === "function" ? callback() : {};
  });
}

Task.prototype.saveInFile = function (callback) {
  let self = this;
  let file = Config.TASK_STORE_DIR;
  if (!fs.existsSync(file)) { fs.mkdirSync(file); }
  fs.writeFile(`${file}/${self.id}.txt`, JSON.stringify(self), function (err) {
    if (err) { 
      Logging.logError(err, "Task.js", __STACK__[1].getLineNumber());
    }
    typeof callback === "function" ? callback() : {};
  });
}

Task.prototype.store = function (callback) {
  let self = this;
  let file = Config.TASK_STORE_DIR;
  if (!fs.existsSync(file)) { fs.mkdirSync(file); }
  fs.appendFile(`${file}/task_list.txt`, `${self.id},`, function (err) {
    if (err) {
      Logging.logError(err, "Task.js", __STACK__[1].getLineNumber());
    }
    self.saveInFile(function () {
      typeof callback === "function" ? callback() : {};
    });
  });
}

/* Update the task completion status. */
Task.prototype.updateTaskStatus = function (status, callback) {
  this.status = status;
  this.saveInFile(function () {
    typeof callback === "function" ? callback() : {};
  });
}

/* Add time constraint on the task. */
Task.prototype.addTimeLimit = function (endTime) {
  this.endTime = endTime;
  this.saveInFile(function () {
    typeof callback === "function" ? callback() : {};
  });
}

/* Delete the task from the record. */
Task.prototype.delete = function () {
  let self = this;
  let file = Config.TASK_STORE_DIR;
  fs.unlinkSync(`${file}/${self.id}.txt`);
}

/* HTML template for task. */
Task.prototype.getTaskTemplate = function () {
  let self = this;
  let date = new Date(parseInt(self.startTime));
  let taskNode =
    `<li class="list-group-item" id="${self.id}" status="false">
      <span id="task-complete-icon"><i class="fa fa-check"></i></span>
      <span class="task-text">
        <span class="task-text-cont">${self.text}</span>
        <br />
        <span class="task-start-date">${date.getDate()}/${(date.getMonth() + 1)}/${date.getFullYear()}</span>
        <span class="task-end-time"></span>
      </span>
      <div class="task-options-cont">
        <div class="dot-set dropdown" id="dropdownMenu2" data-toggle="dropdown" aria-expanded="false">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <div id="task-options-menu" class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu2">
          <a class="complete-task-btn" status="false" class="dropdown-item" href="#">Task Complete</a>
          <a class="delete-task-btn" class="dropdown-item" href="#">Delete Task</a>
          <a class="add-time-limit-btn" task-id="" class="dropdown-item" data-toggle="modal" data-target="#task-time-limit-cont" href="#">Add Time Limit</a>
        </div>
      </div>
    </li>`;

  return taskNode;
}

/* Attach the node to the display list. */
Task.prototype.displayTaskNode = function (type) {
  let node = this.getTaskTemplate();
  switch (type) {
    case "append":
      $('#task-list-cont ul').append(node);
      break;

    case "prepend":
      $('#task-list-cont ul').prepend(node);
      break;
  }
  $("#" + this.id).data("data", this);

  return $(node);
}


module.exports = Task;
