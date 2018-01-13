const fs = require('fs');
const logger = require('tracer').colorConsole();

window.$ = window.jQuery = require('./assets/js/jquery-3.2.1.min.js');

var taskList = [];

const USER_LIST_FILE_PATH = "./data-store/user-store/user_list.txt";
var nextUserId = 0;

var SESSION_STORE = "";

/* Common key codes. */
const KeyCodes = {
  "ESCAPE": 27,
  "CONTROL": 17,
  "SHIFT": 16,
  "ALT": 18,
  "ENTER": 13
};

$(function () {
  var filePath = './data-store/user-store/next_user_id.txt';
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "0");
  } else {
    /* Read the file containing next user ID to assign. */
    fs.readFile(filePath, function (err, data) {
      if (err) {
        logger.warn('[Error]: ' + err);
      } else {
        nextUserId = data.toString().trim();
      }
    });
  }
});

$(function () {
  centerAbsElementVertically('startup-message');
});

$(function () {
  $('#add-task-btn').click(function () {
    $('#task-add-input-box').slideDown();
    $('#task-text-input').focus();
  });
});

/* For performing operations when certain key combinations are pressed. */
$(function () {
  var keyCombination = "";
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
    if (keyCombination.match(/^[1][7](82)+$/i) !== null) {
      e.preventDefault();
    }

    // If the last key code forms 1723 (that means ctrl + enter is pressed together).
    if (keyCombination.match(/^[1][7](13)+$/i) !== null) {
      addTask($('#task-text-input').val(), 'task_' + new Date().getTime());
    }
    if (keyCombination == "1784") {
      $('#task-add-input-box').slideDown();
      $('#task-text-input').focus();
    }
  });
});

/* To add the task in the list. */
function addTask(taskText, taskId) {
  for (var i = 0; i < taskList.length; i++) {
    if (taskText === taskList[i].split(":")[1]) {
      $('#task-input-error-box').text('Task already added!').slideDown(300);
      return;
    }
  }
  $('#task-list-cont ul').append('<li class="list-group-item" id="' + taskId + '">' + taskText + '<span class="delete-task-btn"><i class="fa fa-trash"></i></span></li>');
  attachTaskDeleteBtnListener();

  var taskInfo = taskId + ":" + taskText;
  taskList.push(taskInfo);
  addTaskInStore(SESSION_STORE, taskInfo);
}

/* Attach click listener on the delete button of the task node. */
function attachTaskDeleteBtnListener() {
  $(function () {
    /*
     * Since this event listener is attached twice (one when 
     * a new task is added and other when tasks are loaded), this will 
     * lead to the same event handler called twice on the elements
     * on which this same event handler was attached before.
     * But each time the listener is added, all the elements 
     * (newly added and loaded ones) are attached to the listener,
     * so it won't be problem if the previous listener is removed.
     * Just unbind the first and add new.
     */
    $('.delete-task-btn').unbind('click');

    // Attach again.
    $('.delete-task-btn').click(function () {
      // Remove error message if add task modal is open.
      $('#task-input-error-box').text("").slideUp(300).css('color', 'black');
      var nodeId = $(this).parent().attr('id');
      $('#' + nodeId).remove();
      deleteTaskFromStore(SESSION_STORE, nodeId);
    });
  });
}

/* Add the task in record. */
function addTaskInStore(userId, taskInfo) {
  var filePath = './data-store/user-store/' + userId + '/task-store-dir/';
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  var info = taskInfo.split(":");
  fs.appendFileSync(filePath + '/' + 'task-list.txt', info[0] + '\n');
  fs.writeFileSync(filePath + '/' + info[0] + '.txt', info[1]);
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

/* Delete the task from the record. */
function deleteTaskFromStore(userId, taskId) {
  var filePath = './data-store/user-store/' + userId + '/task-store-dir/task-list.txt';
  if (!fs.existsSync(filePath)) {
    return {
      "status": false,
      "error": "NO_RECORD"
    }
  } else {
    var list = fs.readFileSync(filePath).toString().split("\n");
    list.pop();
    var finalList = "";

    for (var i = 0; i < list.length; i++) {
      if (list[i].split(":")[0] === taskId) {
        list.splice(i, 1);
        break;
      }
    }

    for (var i = 0; i < list.length; i++) {
      finalList += list[i] + "\n";
    }

    fs.writeFileSync(filePath, finalList);
    fs.unlinkSync('./data-store/user-store/' + userId + '/task-store-dir/' + taskId + '.txt');
  }
}

/* Load the task list. */
function loadTaskList(userId) {
  var filePath = './data-store/user-store/' + userId + '/task-store-dir/task-list.txt';
  if (!fs.existsSync(filePath)) {
    return {
      "status": false,
      "error": "NO_RECORD"
    };
  } else {
    taskList = fs.readFileSync(filePath).toString().split("\n");
    taskList.pop();

    $('#task-list-cont ul').html('<li style="display: none;" id="task_0" class="list-group-item"><span class="delete-task-btn"><i class="fa fa-trash"></i></span><!-- <input type="checkbox" taskid="task_0" class="select-task" /> --></li>');
    for (var i = 0; i < taskList.length; i++) {
      var data = fs.readFileSync('./data-store/user-store/' + userId + '/task-store-dir/' + taskList[i] + '.txt');
      $('#task-list-cont ul').append('<li class="list-group-item" id="' + taskList[i] + '">' + data + '<span class="delete-task-btn"><i class="fa fa-trash"></i></span></li>');
    }
    attachTaskDeleteBtnListener();
  }
}

/* Open reglog pane when startup message screen button is clicked. */
$('#startup-message-btn').click(function () {
  $('#startup-message-screen').slideUp(300);
  document.getElementById("reglog-page").style.width = "100%";
  $('#tab-cont').fadeIn(500);
});

/* For centering the absolute positioned elements. */
function centerAbsElementVertically(elementId) {

  // In case elementId is passed as #<elementId>, take the substring from position 1.
  elementId = (elementId.charAt(0) === "#") ? elementId.substr(1) : elementId;

  var elementHeight = Math.round(($(window).innerHeight() / 2) - ($('#' + elementId).innerHeight() / 2));
  if (elementHeight < 0) { return; }
  $('#' + elementId).css('margin-top', (elementHeight.toString() + '.px'));
}


/**
 * Toggles load spinner element on and off based on boolean value.
 *
 * @param {boolean} state - True for show load spinner and false for remove.
 */
function loadSpinner(state, elementId) {
  if (state === undefined) {
    return;
  }

  // Check if the elementId is containing '#' as prefix or not.
  elementId = elementId.charAt(0) === "#" ? elementId.substr(1) : elementId;
  var node = $('#' + elementId);

  if (state) {
    // Load the spinner and loading title below it.
    node.children('.spin').fadeOut(0).addClass('load-spinner').fadeIn(300);
    node.children('.spin-load-title').fadeIn(100);
  } else {
    // Remove the loading spinner and title below it.
    node.children('.spin').fadeOut(300).removeClass('load-spinner');
    node.children('.spin-load-title').fadeOut(100);
  }
}

