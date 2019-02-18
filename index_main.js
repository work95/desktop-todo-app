const countdown = require('countdown');
const fs = require('fs');

const TaskHandler = require("./task_handler");
const Config = require("./Config");
const NotificationHandler = require("./notification_handler");

/* Show the task input box when plus button on the header is clicked. */
function attachAddTaskBtnListener() {
  $(function () {
    $('#add-task-btn').unbind('click');

    $('#add-task-btn').click(function () {
      $('#task-add-input-box').slideDown(250);
      $('#task-text-input').focus();
    });
  });
}

$(function () {
  $('#close-task-time-limit-modal').click(function () {
    let day = $('#task-time-input-day').val().trim();
    let month = $('#task-time-input-month').val().trim();
    let year = $('#task-time-input-year').val().trim();
    let hour = $('#task-time-input-hour').val().trim();
    let minute = $('#task-time-input-minute').val().trim();
    let second = $('#task-time-input-second').val().trim();

    let endTime = new Date(year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second).getTime();
    let taskId = $(this).attr('task-id').toString();
    if ($('#remove-time-check input').prop('checked')) {
      endTime = null;
    }

    TaskHandler.addTaskTimeLimit(taskId, endTime);
  });
});

$(function () {
  setInterval(function () {
    setTaskTimeLeft();
  }, 3000);
});

function setTaskTimeLeft() {
  let units = countdown.YEARS | countdown.MONTHS | countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS;
  let list = Config.TASK_LIST.toKeyArray();

  for (let i = 0; i < list.length; i++) {
    let info = Config.TASK_LIST.get(list[i]);
    let node = $('#' + info["taskId"] + ' span .task-end-time');
    if (!info["taskEndTime"]) {
      node.text("");
      if ($('#' + info[0]).attr('status') === 'true') {
        $('#' + info[0]).css('border', '2px solid rgba(61, 199, 52, 0.43)');
      } else {
        $('#' + info[0]).css('border', 'none');
      }
    } else {
      let dateStart = new Date();
      let dateEnd = new Date(parseInt(info["taskEndTime"]));
      let timeString = dateStart < dateEnd ? (countdown(new Date(), new Date(parseInt(info["taskEndTime"])), units).toString()) : "Time over";
      if (info["taskStatus"]) {
        node.text("");
        $('#' + info[0]).css('border', '2px solid rgba(61, 199, 52, 0.43)');
      } else {
        if (timeString === "Time over") {
          node.text(timeString);
          $('#' + info[0]).css('border', '2px solid rgba(255, 0, 0, 0.43)');
        } else {
          node.text(timeString);
          $('#' + info[0]).css('border', 'none');
        }
      }
    }
  }
}

/* Attaching click listeners on various options of the task. */
function attachTaskOptionBtnListener() {
  $(function () {
    /* Unbind the previous ones. */
    $('.delete-task-btn').unbind('click');
    $('.complete-task-btn').unbind('click');
    $('.add-time-limit-btn').unbind('click');

    /* 
     * Bind again. 
     */

    $('.delete-task-btn').click(function () {
      // Remove error message if add task modal is open.
      $('#task-input-error-box').text("").slideUp(300).css('color', 'black');
      let nodeId = $(this).parent().parent().parent().attr('id');
      TaskHandler.deleteTaskFromStore(nodeId, function () {
        $('#' + nodeId).remove();
      });
    });

    $('.complete-task-btn').click(function () {
      $('#task-input-error-box').text("").slideUp(300).css('color', 'black');
      let nodeId = $(this).parent().parent().parent().attr('id');
      if ($(this).attr('state') === "false") {
        $(this).attr('state', 'true');
        $('#' + nodeId).attr('status', 'true');
        $('#' + nodeId + ' .task-text').css('opacity', '0.5');
        $(this).html('<span><i class="fa fa-check"></i></span>Undone task');
        $(this).parent().parent().parent().children('span#task-complete-icon').fadeIn(300);
        TaskHandler.updateTaskCompleteInStore(nodeId, true);
      } else {
        $(this).attr('state', 'false');
        $('#' + nodeId).attr('status', 'false');
        $('#' + nodeId + ' .task-text').css('opacity', '1');
        $(this).html('<span><i class="fa fa-check"></i></span>Complete task');
        $(this).parent().parent().parent().children('span#task-complete-icon').fadeOut(300);
        TaskHandler.updateTaskCompleteInStore(nodeId, false);
      }
    });

    $('.add-time-limit-btn').click(function () {
      let nodeId = $(this).parent().parent().parent().attr('id');
      $('#close-task-time-limit-modal').attr('task-id', nodeId);
      $('#close-task-time-limit-modal').attr('task-type', 'main');

      // Fill in the input boxes with current date parameters.
      let date = new Date();
      $('#task-time-input-day').val(date.getDate().toString());
      $('#task-time-input-month').val((date.getMonth() + 1).toString());
      $('#task-time-input-year').val(date.getFullYear().toString());
      $('#task-time-input-hour').val(date.getHours().toString());
      $('#task-time-input-minute').val(date.getMinutes().toString());
      $('#task-time-input-second').val(date.getSeconds().toString());

    });
  });
}

function addTask(taskText, callback) {
  let date = new Date().getTime();
  let taskId = `task_${date}`;

  TaskHandler.addTask(taskId, taskText, function (result) {
    $('#task-list-cont ul').append(TaskHandler.getTaskTemplate(taskId, taskText, date));
    attachTaskOptionBtnListener();
    typeof callback === "function" ? callback() : {};
  });
}

/* For performing operations when certain key combinations are pressed. */
function attachWindowKeyListener() {
  $(function () {
    $(window).unbind('keydown');

    var keyCombination = "";
    $(window).on('keydown', function (e) {
      // Close the task text dialog box when escape key is pressed.
      if (e.keyCode === Config.KeyCodes.ESCAPE) {
        keyCombination = "";
        $('#task-add-input-box').slideUp(250).children('input').val("");
        $('#task-input-error-box').html("");
      }

      if (e.keyCode === Config.KeyCodes.CONTROL) {
        keyCombination = "";
      }

      keyCombination += e.keyCode;    // Concatenate the key code.

      // Refresh application.
      if (keyCombination.match(/^[1][7](82)+$/) !== null) {
        // e.preventDefault();
      }

      // If the last key code forms 1723 (that means ctrl + enter is pressed together).
      if (keyCombination.match(/^[1][7](13)+$/) !== null) {
        if ($('#task-text-input').val() === "") {
          $('#task-input-error-box').html("Nothing entered").slideDown(300);
          return;
        }
        addTask($('#task-text-input').val(), function () { });
      }
      if (keyCombination === "1784") {
        $('#task-add-input-box').slideDown(250);
        $('#task-text-input').focus();
      }
    });
  });
}

/* Load the task list. */
function displayTaskList(callback) {
  // Cache the Task list.
  let taskList = Config.TASK_LIST.toKeyArray();

  // Clear the display list first (in case, updating the list).
  $('#task-list-cont ul').html('');

  for (let i = 0; i < taskList.length; i++) {
    let data = Config.TASK_LIST.get(taskList[i]);
    $('#task-list-cont ul').append(TaskHandler.getTaskTemplate(taskList[i], data["taskText"], data["taskStartTime"]));
    if (!data["taskStatus"]) {
      $('#' + taskList[i] + ' #task-complete-icon').fadeOut(300);
      $('#' + taskList[i]).attr('status', 'false');
      $('#' + taskList[i] + ' .task-text').css('opacity', '1');
      $('#' + taskList[i] + ' div div ' + '.complete-task-btn').attr('state', 'false').html('<span><i class="fa fa-check"></i></span>Complete task');;
    } else {
      $('#' + taskList[i] + ' #task-complete-icon').fadeIn(300);
      $('#' + taskList[i]).attr('status', 'true');
      $('#' + taskList[i] + ' .task-text').css('opacity', '0.5');
      $('#' + taskList[i] + ' div div ' + '.complete-task-btn').attr('state', 'true').html('<span><i class="fa fa-check"></i></span>Undone task');
    }
  }
  attachTaskOptionBtnListener();
  typeof callback === "function" ? callback() : {};
}

const IndexMain = module.exports = {

  // Check the storage directory structure.
  checkDirectoryStructure: function () {
    // Parent storage directory.
    let mainDir = `./data-store/`;
    
    if (!fs.existsSync(mainDir)) { fs.mkdirSync(mainDir); }
  },

  // Load the User Id of the last logged in user or use default user.
  loadUserId: function () {
    let userDir = `./data-store/user-store/`;
    let userFile = `${userDir}/last_login.txt`;

    if (!fs.existsSync(userDir)) { 
      fs.mkdirSync(userDir);
      fs.writeFileSync(userFile, "");
      return null;
    }

    // Create or read and return.
    if (!fs.existsSync(userFile)) { 
      fs.writeFileSync(userFile, ""); 
    } else {
      return fs.readFileSync(userFile).toString();
    }
  },

  init: function () {
    // Check directory structure.
    IndexMain.checkDirectoryStructure();

    // Load USER_ID.
    Config.USER_ID = IndexMain.loadUserId() || "user_0";

    // Attach window key listeners.
    attachWindowKeyListener();

    TaskHandler.loadTaskList(function () {
      displayTaskList(function () {
        NotificationHandler.checkNotifications();
        setInterval(function () {
          NotificationHandler.checkNotifications();
        }, 5000);
        attachAddTaskBtnListener();
      });
    });
  }
};

$(function () {
  $('#notification-icon').click(function () {
    showNotificationPane();
  });
});

$(function () {
  $('#notification-pane-close-btn').click(function () {
    closeNotificationPane();
  });
});

function showNotificationPane() {
  // Don't hide the badge.
  // NotificationHandler.NOTIFICATION_COUNT = 0;
  // $('#notification-count-badge').fadeOut(200).text(NotificationHandler.NOTIFICATION_COUNT);
  $('#notification-pane').slideDown(200);
}

function closeNotificationPane() {
  $('#notification-pane').slideUp(200);
}
