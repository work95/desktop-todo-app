const fs = require('fs');
const logger = require('tracer').colorConsole();

window.$ = window.jQuery = require('./assets/js/jquery-3.2.1.min.js');

var taskList = [];
var nextTask = 0;
var selectedTask = [];

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

function disableReloadKeyShortcut() {
  $(window).on('keydown', function (e) {
    var keyCombination = "";
    if (e.keyCode === KeyCodes.CONTROL) {
      keyCombination = "";
    }
    keyCombination += e.keyCode;
 
    if (keyCombination.match(/^[1][7](82)+$/i) !== null) {
      e.preventDefault();
    }
  });
}

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
  addTaskInStore(SESSION_STORE, taskText);
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


/* For registering the user. */
function registerUser(name, email, password, callback) {

  // Check for existence of '/data-store/user-store' directory.
  if (!fs.existsSync('./data-store/user-store/')) {
    fs.mkdirSync('./data-store/user-store/');
  } else {
    fs.readFile(USER_LIST_FILE_PATH, function (err, data) {
      if (err) {
        logger.warn('[Error]: ' + err);
      } else {
        var userList = data.toString().split(',').pop();
        for (var i = 0; i < userList.length; i++) {
          if (email === userList[i].split(":")[0]) {
            callback({
              "status": false,
              "error": "USER_ALREADY_REGISTERED"
            });
          }
        }
      }
    });
  }

  var file = fs.appendFile(USER_LIST_FILE_PATH, (email + ":" + nextUserId) + ",", function (err) {
    if (err) {
      logger.warn('[Error]: ' + err);
    } else {
      logger.info('User ['  + email + '] registered');
    }
  });

  /* Create a directory for user. */

  fs.mkdirSync('./data-store/user-store/' + nextUserId);

  // Add a file for user information.
  var userInfo = name + "\n" + email + "\n" + password;
  fs.appendFile('./data-store/user-store/' + nextUserId + '/user_info.txt', userInfo, function (err) {
    if (err) {
      logger.warn('[Error]: ' + err);
    } else {
      fs.appendFile('./data-store/user-store/' + nextUserId + '/user_task_list.txt', "", function (err) {
        if (err) {
          logger.warn('[Error]: ' + err);
        } else {
          // Update the 'nextUserId' in file.
          fs.writeFileSync('./data-store/user-store/next_user_id.txt', (++nextUserId).toString());
          $('#reglog-btn').fadeOut(10);
          $('#sign-out-btn').fadeIn(300);
          closeRegLogPane();
        }
      });
    }
  });
}


/* For signing the user in by checking his/her credentials. */
function loginUser(email, password, callback) {

  if (!fs.existsSync('./data-store/user-store/')) {
    fs.mkdirSync('./data-store/user-store/');
  }

  fs.readFile(USER_LIST_FILE_PATH, function (err, data) {
    if (err) {
      logger.warn('[Error]: ' + err);
    } else {

      // Get the users from the user list.
      var userList = data.toString().split(',');
      userList.pop();
      for (var i = 0; i < userList.length; i++)  {

        // Split the user's email from the ID.
        var userInfo = userList[i].split(":");
        if (userInfo[0] === email) {

          // Read the user's information to fetch the password.
          fs.readFile('./data-store/user-store/' + userInfo[1] + '/user_info.txt', function (err, data) {
            if (err) {
              logger.warn('[Error]: ' + err);
            } else {

              // Compare the passwords.
              var completeInfo = data.toString().split("\n");
              if (password === completeInfo[2]) {

                // On success, return the name of the user.
                callback({
                  "status": "true",
                  "name": completeInfo[0],
                  "userId": userInfo[1]
                });

              } else {
                // On failure, return a false status.
                callback({
                  "status": "false"
                });
              }

            }
          });
        } else {
          callback({
            "status": false,
            "error": "NO_SUCH_USER"
          });
        }
      }
    }
  });
}


/* Register button click listener. */
$(function () {
  $('#register-btn').click(function () {

    /* Do validation first. */

    registerUser($('#orangeForm-name').val().trim(), $('#orangeForm-email').val().trim(), $('#orangeForm-pass').val().trim());
    $('#add-task-btn').removeClass('disabled');
    $('#delete-task-btn').removeClass('disabled');
  });
});


/* Login button click listener. */
$(function () {
  $('#login-btn').click(function () {
    
    /* Do validation first. */

    loginUser($('#defaultForm-email').val().trim(), $('#defaultForm-pass').val().trim(), function (result) {
      if (!result.status) {
        // Return an unsuccessful result.
      } else {
        // Store the session of the logged in user.
        SESSION_STORE = result.userId;
        $('#user-name-display h2').text("Hi. " + result.name);
        $('#reglog-btn').fadeOut(10);
        $('#sign-out-btn').fadeIn(300);
        closeRegLogPane();
        $('#add-task-btn').removeClass('disabled');
        $('#delete-task-btn').removeClass('disabled');
        loadTaskList(SESSION_STORE);
      }
    });
  });
});


function loadTaskList(userId) {
  var filePath = './data-store/user-store/' + userId + '/user_task_list.txt';
  if (!fs.existsSync(filePath)) {
    return {
      "status": false,
      "error": "NO_RECORD"
    };
  } else {
    var taskList = fs.readFileSync(filePath).toString().split("\n//--//\n");
    taskList.pop();

    $('#task-list-cont ul').html("");
    for (var i = 0; i < taskList.length; i++) {
      $('#task-list-cont ul').append('<li class="list-group-item" id="task_' + ++nextTask + '">' + taskList[i] + '<input type="checkbox" taskid="task_' + nextTask + '" class="select-task" /></li>');
    }
  }
}

function addTaskInStore(userId, taskInfo) {
  var filePath1 = './data-store/user-store/' + userId + '/user_task_list.txt';
  var inputMessage = taskInfo + "\n//--//\n";
  if (!fs.existsSync(filePath1)) {
    fs.writeFileSync(filePath1, inputMessage);
  } else {
    fs.appendFileSync(filePath1, inputMessage);
  }

  var filePath2 = './data-store/user-store/' + userId + '/last_task_number.txt';
  if (!fs.existsSync(filePath2)) {
    fs.writeFileSync(filePath2, nextTask.toString());
  } else {
    fs.appendFileSync(filePath2, nextTask.toString());
  }

}


/* For handling the tabs. */
var activeTab = "pane2";
$(function () {
  $('.nav-item').click(function () {
    var tabId = $(this).children('a').attr('ref');
    if (activeTab === tabId) { return; }
    $('#' + activeTab).fadeOut(10);
    $('#' + tabId).fadeIn(10);
    activeTab = tabId;
  });
});


/* For closing the register login page. */
$(function () {
  $('#reglog-close-btn').click(function () {
    closeRegLogPane();
  });
});


/* For opening the register login page. */
$(function () {
  $('#reglog-btn').click(function () {
    document.getElementById("reglog-page").style.width = "100%";
    $('#tab-cont').fadeIn(500);
  });
});

function closeRegLogPane() {
  document.getElementById("reglog-page").style.width = "0";
  $('#tab-cont').fadeOut(200);
}

$(function () {
  $('#sign-out-btn').click(function () {
    SESSION_STORE = "";
    $('#user-name-display h2').text("Todo");
    $('#sign-out-btn').fadeOut(10);
    $('#reglog-btn').fadeIn(300);

    nextTask = 0;
    $('#task-list-cont ul').html("");
    $('#add-task-btn').addClass('disabled');
    $('#delete-task-btn').addClass('disabled');
  });
});


$('#startup-message-btn').click(function () {
  $('#startup-message-screen').slideUp(300);
  document.getElementById("reglog-page").style.width = "100%";
  $('#tab-cont').fadeIn(500);
});


/* For centering the absolute positioned elements. */
function centerAbsElementVertically(elementId) {

  /* In case elementId is passed as #<elementId>, take the substring from position 1. */
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

