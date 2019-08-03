"use strict";

const Config = require("./Config");
const Timer = require("./Timer");


const UiIndex = module.exports = {

  /* Attaching click listeners on various options of the task. */
  attachTaskOptionBtnListener: function () {
    $(function () {
      /* Unbind the previous ones. */
      $('.complete-task-btn').unbind('click');
      $('.add-time-limit-btn').unbind('click');

      /* Complete or undo the same, event handler. */
      $('.complete-task-btn').click(function () {
        $('#task-input-error-box').text("").slideUp(300).css('color', 'black');
        let parentNode = $(this).parent().parent();
        let obj = $(parentNode).data("data");

        if ($(this).attr("status") === "false") {
          UiIndex.updateNodeLook(parentNode, true);
          $('#task-list-cont ul').append(parentNode);
          $(`#${obj.id} span .task-end-time`).text("");
          clearInterval(Config.Timers[obj.id]);
          delete Config.Timers[obj.id];
          Config.Tasks.updateTaskStatus(obj.id, true);
        } else {
          UiIndex.updateNodeLook(parentNode, false);
          new Timer(obj.id, $(`#${obj.id} span .task-end-time`), obj.endTime);
          $('#task-list-cont ul').prepend(parentNode);
          Config.Tasks.updateTaskStatus(obj.id, false);
        }
      });

      /* Set time limit modal opening event handler. */
      $('.add-time-limit-btn').click(function () {
        let nodeId = $(this).parent().parent().attr('id');
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

  /* Update the value of the task input form. */
  updateTaskInputValue: function (value) {
    $("#task-text-input").val(value);
  },

  /* For performing operations when certain key combinations are pressed. */
  attachWindowKeyListener: function () {
    document.addEventListener('keydown', (event) => {
      const keyName = event.key;
      const keyCode = event.keyCode;

      // When escape key is pressed. Close all other windows and go back to word-meaning pane.
      if (keyCode === Config.KeyCodes.ESCAPE) {}

      // Do not alert when only Control key is pressed.
      if (keyCode === Config.KeyCodes.CONTROL) {
        return;
      }

      if (event.ctrlKey) {
        // Even though event.key is not 'Control' (e.g., 'a' is pressed),
        // event.ctrlKey may be true if Ctrl key is pressed at the same time.
        switch (keyName) {
          case "f":
            break;

            case "t":
            break;

          // Refresh app.
          case "r":
            // event.preventDefault();
            break;

          // Process the inputted task text.
          case "Enter":
            event.preventDefault();
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
    let task = Config.Tasks.getTask(taskId);
    Config.Tasks.addTaskTimeLimit(task.id, endTime);
    if ($('#remove-time-check input').prop('checked')) {
      endTime = null;
      clearInterval(Config.Timers[taskId]);
      delete Config.Timers[taskId];
      $(`#${taskId} span .task-end-time`).text("");
    } else if (!task.status) {
      // Delete previous timers, if any.
      clearInterval(Config.Timers[taskId]);
      delete Config.Timers[taskId];
      new Timer(taskId, $(`#${taskId} span .task-end-time`), endTime);
    }
  });
});
