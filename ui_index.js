"use strict";

const countdown = require('countdown');
const Config = require("./Config");
const TaskHandler = require("./task_handler");

const UiIndex = module.exports = {

  /* For adding the task text to the storage and display it. */
  addTask: function (taskText, callback) {
    let date = new Date().getTime();
    let taskId = `task_${date}`;

    TaskHandler.addTask(taskId, taskText, function (result) {
      UiIndex.attachTaskNodeToTheDisplay(TaskHandler.getTaskTemplate(taskId, taskText, date), "append");
      UiIndex.attachTaskOptionBtnListener();
      typeof callback === "function" ? callback() : {};
    });
  },

  /* Attach the node to the display list. */
  attachTaskNodeToTheDisplay: function (node, type) {
    switch (type) {
      case "append": 
        $('#task-list-cont ul').append(node);
        break;

      case "prepend":
        break;
    }
  },

  /* Attaching click listeners on various options of the task. */
  attachTaskOptionBtnListener: function () {
    $(function () {
      /* Unbind the previous ones. */
      $('.delete-task-btn').unbind('click');
      $('.complete-task-btn').unbind('click');
      $('.add-time-limit-btn').unbind('click');

      /* 
       * Bind again. 
       */

       /* Delete the task button event handler. */
      $('.delete-task-btn').click(function () {
        // Remove error message if add task modal is open.
        $('#task-input-error-box').text("").slideUp(300).css('color', 'black');
        let nodeId = $(this).parent().parent().parent().attr('id');
        TaskHandler.deleteTaskFromStore(nodeId, function () {
          // Remove the task list node.
          $("#" + nodeId).remove();

          // Remove the notification list node.
          $("#notif_" + nodeId).remove();
        });
      });

      /* Complete or undo the same, event handler. */
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

      /* Set time limit modal opening event handler. */
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
  },

  /* Load the task list. */
  displayTaskList: function (callback) {
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
    UiIndex.attachTaskOptionBtnListener();
    typeof callback === "function" ? callback() : {};
  },

  /* Keep on updating the timer on each task which has a time constraint. */
  setTaskTimeLeft: function () {
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
  },

  /* Show the notification pane. */
  showNotificationPane: function () {
    $("#notification-pane").slideDown(200);
  },

  /* Hide the notification pane. */
  closeNotificationPane: function () {
    $("#notification-pane").slideUp(200);
  },

  showTaskInputBox: function () {
    // Drop the task text input.
    $("#task-add-input-box").slideDown(250);
    // Bring focus on the input form.
    $("#task-text-input").focus();
  },

  /* Hide the task input form box. */
  hideTaskInputBox: function () {
    // Drop the task text input.
    $("#task-add-input-box").slideUp(250);
    UiIndex.updateTaskInputValue("");
    UiIndex.updateTaskInputErrorBoxMessage("");
    UiIndex.hideTaskInputErrorBoxMessage();
  },

  /* Update the value of the task input form. */
  updateTaskInputValue: function (value) {
    $("#task-text-input").val(value);
  },

  /* Get the value of the task input form. */
  getTaskInputBoxValue: function () {
    return $("#task-text-input").val() || "";
  },

  /* Show the error box for the task input form. */
  showTaskInputErrorBox: function (message) {
    $("#task-input-error-box").html((message || "")).slideDown(300);
  },

  /* Update the message of the task input form. */
  updateTaskInputErrorBoxMessage: function (message) {
    $("#task-input-error-box").html(message);
  },

  /* Hide the error box for the task input form. */
  hideTaskInputErrorBoxMessage: function () {
    $("#task-input-error-box").slideUp(300);
  },

  /* Show the notification counter badge. */
  showNotificationCounterBadge: function (count) {
    $("#notification-count-badge").fadeIn(100).text(count);
  },

  /* Hide the notification counter badge. */
  hideNotificationCounterBadge: function () {
    $("#notification-count-badge").fadeOut(100);
  },

  /* For performing operations when certain key combinations are pressed. */
  attachWindowKeyListener: function () {
    document.addEventListener('keydown', (event) => {
      const keyName = event.key;
      const keyCode = event.keyCode;

      // When escape key is pressed. Close all other windows and go back to word-meaning pane.
      if (keyCode === Config.KeyCodes.ESCAPE) {
        UiIndex.hideTaskInputBox();
      }

      // Do not alert when only Control key is pressed.
      if (keyCode === Config.KeyCodes.CONTROL) {
        return;
      }

      if (event.ctrlKey) {
        // Even though event.key is not 'Control' (e.g., 'a' is pressed),
        // event.ctrlKey may be true if Ctrl key is pressed at the same time.
        switch (keyName) {
          case "t":
            UiIndex.showTaskInputBox();
            break;

          // Refresh app.
          case "r":
            // event.preventDefault();
            break;

          // Process the inputted task text.
          case "Enter":
            event.preventDefault();
            let inputVal = UiIndex.getTaskInputBoxValue();
            // If nothing is entered, show the error message.
            if (inputVal.length < 1) {
              UiIndex.showTaskInputErrorBox("Nothing entered");
              return;
            }

            // Save and display the task.
            UiIndex.addTask(inputVal, function () {
              // Reset the input form.
              UiIndex.updateTaskInputValue("");
            });
            break;
        }
      }
    }, false);
  }
}

/* Process the modal input for setting time limit on some task. */
$(function () {
  $('#close-task-time-limit-modal').click(function () {
    let day = $('#task-time-input-day').val().trim();
    let month = $('#task-time-input-month').val().trim();
    let year = $('#task-time-input-year').val().trim();
    let hour = $('#task-time-input-hour').val().trim();
    let minute = $('#task-time-input-minute').val().trim();
    let second = $('#task-time-input-second').val().trim();

    let endTime = new Date(`${year}/${month}/${day} ${hour}:${minute}:${second}`).getTime();
    let taskId = $(this).attr('task-id').toString();
    if ($('#remove-time-check input').prop('checked')) {
      endTime = null;
    }

    TaskHandler.addTaskTimeLimit(taskId, endTime);
  });
});

/* Show the task add input form box. */
$(function () {
  $('#add-task-btn').click(function () {
    UiIndex.showTaskInputBox();
  });
});

/* Show the notification pane. */
$(function () {
  $('#notification-icon').click(function () {
    UiIndex.showNotificationPane();
  });
});

/* Close the notification pane. */
$(function () {
  $('#notification-pane-close-btn').click(function () {
    UiIndex.closeNotificationPane();
  });
});

/* Notification list to be watched for changes. */
const targetList = document.getElementById("notification-list");

// What attributes to watch for.
const observerPreferences = {
  childList: true
};

// Observer initialization.
const NotificationListObserver = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.type === "childList") {
      // Get the notification children list size.
      Config.NOTIFICATION_COUNT = $("#notification-list").children().length;

      // Get the Id of the node removed, captured by the mutation object.
      let notificationId = $(mutation.addedNodes[0]).attr("id");

      // Get the index of the notification, which is removed.
      let index = Config.SHOWN_NOTIFICATIONS.indexOf(notificationId);
      // Remove the element from the array.
      if (index > 0) { Config.SHOWN_NOTIFICATIONS.splice(index, 1); }

      // If count is greater than 0, show the badge (while updating it too), else hide it.
      if (Config.NOTIFICATION_COUNT > 0) {
        UiIndex.showNotificationCounterBadge(Config.NOTIFICATION_COUNT);
      } else {
        UiIndex.hideNotificationCounterBadge();
      }
    }
  });
});

// Start observing.
NotificationListObserver.observe(targetList, observerPreferences);
