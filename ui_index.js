"use strict";

const countdown = require('countdown');
const Config = require("./Config");
const Task = require("./Task");


const UiIndex = module.exports = {

  /* For adding the task text to the storage and display it. */
  addTask: function (taskText, callback) {
    let task = new Task(null, taskText);
    task.save(function () {
      task.displayTaskNode("prepend");
      UiIndex.attachTaskOptionBtnListener();
      typeof callback === "function" ? callback() : {};
    });
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
        let obj = $($(this).parent().parent().parent()).data("data");
        Config.Tasks.removeAndStore(obj, function () {
          // Remove the task list node.
          $("#" + obj.id).remove();
  
          // Remove the notification list node.
          $("#notif_" + obj.id).remove();
        });
      });

      /* Complete or undo the same, event handler. */
      $('.complete-task-btn').click(function () {
        $('#task-input-error-box').text("").slideUp(300).css('color', 'black');
        let parentNode = $(this).parent().parent().parent();
        let obj = $(parentNode).data("data");

        if ($(this).attr("status") === "false") {
          UiIndex.updateNodeLook(parentNode, true);
          $('#task-list-cont ul').append(parentNode);
          obj.updateTaskStatus(true, function () { });
        } else {
          UiIndex.updateNodeLook(parentNode, false);
          $('#task-list-cont ul').prepend(parentNode);
          obj.updateTaskStatus(false, function () { });
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

  updateNodeLook: function (node, status) {
    $(node).attr("status", status);
    if (status) {
      $(node).children(".task-options-cont").children("#task-options-menu").children(".complete-task-btn").attr("status", status).html("Undone Task");
      $(node).children(".task-text").addClass("disabled-fade").children(".task-text-cont").addClass("strikethrough");
    } else {
      $(node).children(".task-options-cont").children("#task-options-menu").children(".complete-task-btn").attr("status", status).html("Complete Task");
      $(node).children(".task-text").removeClass("disabled-fade").children(".task-text-cont").removeClass("strikethrough");
    }
  },

  /* Load the task list. */
  displayTaskList: function (callback) {
    // Cache the Task list.
    let taskList = Config.Tasks.getKeys();

    // Clear the display list first (in case, updating the list).
    $('#task-list-cont ul').html('');

    for (let i = 0; i < taskList.length; i++) {
      let data = Config.Tasks.getTask(taskList[i]);
      $(`#${taskList[i]}`).attr("status", data.status);
      if (!data.status) {
        data.displayTaskNode("prepend");
        $(`#${taskList[i]}`).children(".task-text").removeClass("disabled-fade").children(".task-text-cont").removeClass("strikethrough");
        $(`#${taskList[i]}`).children(".task-options-cont").children("#task-options-menu").children(".complete-task-btn").attr("status", data.status).html("Complete task");
      } else {
        data.displayTaskNode("append");
        $(`#${taskList[i]}`).children(".task-text").addClass("disabled-fade").children(".task-text-cont").addClass("strikethrough");
        $(`#${taskList[i]}`).children(".task-options-cont").children("#task-options-menu").children(".complete-task-btn").attr("status", data.status).html('Undone task');
      }
    }
    UiIndex.attachTaskOptionBtnListener();
    typeof callback === "function" ? callback() : {};
  },

  /* Keep on updating the timer on each task which has a time constraint. */
  setTaskTimeLeft: function () {
    let units = countdown.YEARS | countdown.MONTHS | countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS;
    let list = Config.Tasks.getKeys();

    for (let i = 0; i < list.length; i++) {
      let info = Config.Tasks.getTask(list[i]);
      let node = $('#' + info.id + ' span .task-end-time');
      if (!info.endTime) {
        node.text("");
        if ($('#' + info[0]).attr('status') === 'true') {
          $('#' + info[0]).css('border', '2px solid rgba(61, 199, 52, 0.43)');
        } else {
          $('#' + info[0]).css('border', 'none');
        }
      } else {
        let dateStart = new Date();
        let dateEnd = new Date(parseInt(info.endTime));
        let timeString = dateStart < dateEnd ? (countdown(new Date(), new Date(parseInt(info.endTime)), units).toString()) : "Time over";
        if (info.status) {
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
    Config.Tasks.getTask(taskId).addTimeLimit(endTime);
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
