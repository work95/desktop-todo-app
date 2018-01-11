window.$ = window.jQuery = require('./assets/js/jquery-3.2.1.min.js');

var taskList = [];
var nextTask = 0;
var selectedTask = [];

/* Common key codes. */
const KeyCodes = {
  "ESCAPE": 27,
  "CONTROL": 17,
  "SHIFT": 16,
  "ALT": 18,
  "ENTER": 13
};

$(function () {
  $('#add-task-btn').click(function () {
    $('#task-add-input-box').slideDown();
    $('#task-text-input').focus();
  });
});


/* For performing operations when certain key combinations are pressed. */
var keyCombination = "";
$(function () {
  $(function () {
    $(window).on('keydown', function (e) {
      // Close the task text dialog box when escape key is pressed.
      if (e.keyCode === KeyCodes.ESCAPE) {
        keyCombination = "";
        $('#task-add-input-box').slideUp().children('input').val("");
        $('#task-input-error-box').html("");
      }

      if (e.keyCode === KeyCodes.CONTROL) {
        keyCombination = "";
      }

      keyCombination += e.keyCode;    // Concatenate the key code.
      
      // If the last key code forms 1723 (that means ctrl + enter is pressed together).
      if (keyCombination.match(/^[1][7](13)+$/i) !== null) {
        addTask($('#task-text-input').val());
      }
      if (keyCombination == "1784") {
        $('#task-add-input-box').slideDown();
        $('#task-text-input').focus();
      }
    });
  });
});


/* To add the task in the list. */
function addTask(taskText) {
  for (var i = 0; i < taskList.length; i++) {
    if (taskText === taskList[i]) {
      $('#task-input-error-box').text('Task already added!').slideDown(300);
      return;
    }
  }
  $('#task-list-cont ul').append('<li class="list-group-item" id="task_' + ++nextTask + '">' + taskText + '<input type="checkbox" taskid="task_' + nextTask + '" class="select-task" /></li>');

  $(function () {
    $('.select-task').click(function () {
      var taskId = $(this).attr('taskid');
      for (var i = 0; i < selectedTask.length; i++) {
        if (selectedTask[i] === taskId) {
          selectedTask.splice(i, 1);
          return;
        }
      }
      selectedTask.push(taskId);
    });
  });

  taskList.push(taskText);
}


/* To hide the error message below the input form when a key is pressed again. */
$(function () {
  $('#task-text-input').on('keydown', function (e) {
    if (e.keyCode === KeyCodes.ENTER) {

      // If control + enter is pressed more than once then show the error in red color.
      if ($('#task-input-error-box').text().length > 1) {
        $('#task-input-error-box').css('color', 'red');
      }
    } else if (e.keyCode === KeyCodes.CONTROL) {
      return; 
    } else {
      $('#task-input-error-box').text("").slideUp(300).css('color', 'black');
    }
  });
});


/* To delete the selected tasks. */
$(function () {
  $('#delete-task-btn').click(function () {

    // Remove error message if add task modal is open.
    $('#task-input-error-box').text("").slideUp(300).css('color', 'black');

    // If no task is selected return.
    if (selectedTask.length < 0) { return; }

    for (var i = 0; i < selectedTask.length; i++) {

      // Remove the task's node from the list.
      $('#' + selectedTask[i]).remove();

      // Remove the removed task from the task list.
      taskList.splice(taskList.indexOf(selectedTask[i]), 1);
    }

    // Empty the selected task list.
    selectedTask = [];
  });
});
