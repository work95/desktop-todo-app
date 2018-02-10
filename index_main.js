const electron = require('electron');
const currentWindow = electron.remote.getCurrentWindow();

const async = require('async');
const fs = require('fs');
const logger = require('tracer').colorConsole();
const countdown = require('countdown');

const logging = require('./logging');

window.$ = window.jQuery = require('./assets/js/jquery-3.2.1.min.js');

/* Server to connect to for storage. */
var TASKING_SERVER_URL = "";

/* Whether there is a connection to any server. */
var CONNECTION_STATE = false;

/* What user ID to assign to next arriving user */
var NEXT_USER_ID = 0;

/* Current user's userID */
var SESSION_STORE = "";

/* Which type of list (project type or normal ones) is currently being managed. */
var LIST_CONT_STATE = 1;

/* Which project is chosen currently. */
var CURRENT_PROJECT_ID = "";

/* Contains the normal tasks. */
var TASK_LIST = [];

/* Contains the projects for which task are managed. */
var PROJECT_LIST = [];

/* Contains the tasks of a particular project (choosen project). */
var PROJECT_TASK_LIST = [];


/* Remove the loading screen. */
function removeLoadingScreen() {
  $('#loading-screen').fadeOut(1200);
}

$(function () {
  if (!fs.existsSync('./data-store')) {
    fs.mkdir('./data-store');
  }
});

$(function () {
  centerAbsElementVertically('startup-message');
});

$(function () {
  $(window).on('resize', function () {
    centerAbsElementVertically('startup-message');
    centerAbsElementVertically('reglog-page');
  });
});

/* Open reglog pane when startup message screen button is clicked. */
$('#startup-message-btn').click(function () {
  $('#startup-message-screen').slideUp(300);
  document.getElementById("reglog-page").style.width = "100%";
  $('#tab-cont').fadeIn(500);
});

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

function validateRegistrationForm() {
  var name = $('#orangeForm-name').val().trim();
  var email = $('#orangeForm-email').val().trim();
  var password = $('#orangeForm-pass').val().trim();
  var errorFlag = 0;

  if (name.length < 1) {
    errorFlag++;
    $('#reg-name-error').text('Name not entered').slideDown(200);;
  } else {
    $('#reg-name-error').text('').slideUp(200);
  }

  if (email.length < 1) {
    errorFlag++;
    $('#reg-email-error').text('Email not entered').slideDown(200);
  } else if (email.match(/[\d\w]+[@][\d\w]+.(com|co[.]in)/ig) === null) {
    errorFlag++;
    $('#reg-email-error').text('Email pattern incorrect').slideDown(200);
  } else {
    $('#reg-email-error').text('').slideUp(200);
  }

  if (password.length < 8) {
    errorFlag++;
    $('#reg-pass-error').text('Password shorter than 8 characters').slideDown(200);
  } else if (password.length > 32) {
    errorFlag++;
    $('#reg-pass-error').text('Password longer than 32 characters').slideDown(200);
  } else if (!((password.search(/\//) < 0) || (password.search(/\\/) < 0)
    || (password.search(/~/) < 0) || (password.search(/|/) < 0)
    || (password.search(/[ ]/) < 0))) {
    errorFlag++;
    $('#reg-pass-error').text('Password contains one of the invalid character [\\, /, ~,  ,|]').slideDown(200);
  } else {
    $('#reg-pass-error').text('').slideUp(200);
  }

  return (errorFlag > 0) ? false : true;
}

function validateLoginForm() {
  var email = $('#defaultForm-email').val().trim();
  var password = $('#defaultForm-pass').val().trim();
  var errorFlag = 0;

  if (email.length < 1) {
    errorFlag++;
    $('#log-email-error').text("Email not entered").slideDown(200);
  } else if (email.match(/[\d\w]+[@][\d\w]+.(com|co[.]in)/ig) === null) {
    errorFlag++;
    $('#log-email-error').text('Email pattern incorrect').slideDown(200);
  } else {
    $('#log-email-error').text("").slideUp(200);
  }

  if (password.length < 8) {
    errorFlag++;
    $('#log-pass-error').text('Password shorter than 8 characters').slideDown(200);
  } else if (password.length > 32) {
    errorFlag++;
    $('#log-pass-error').text('Password longer than 32 characters').slideDown(200);
  } else if (!((password.search(/\//) < 0) || (password.search(/\\/) < 0)
    || (password.search(/~/) < 0) || (password.search(/|/) < 0)
    || (password.search(/[ ]/) < 0))) {
    errorFlag++;
    $('#log-pass-error').text('Password contains one of the invalid character [\\, /, ~,  ,|]').slideDown(200);
  } else {
    $('#log-pass-error').text('').slideUp(200);
  }

  return (errorFlag > 0) ? false : true;
}

function attachTaskListSwitchListener() {
  $(function () {
    $('#switch-list-cont').unbind('click');

    $('#switch-list-cont').click(function () {
      if (LIST_CONT_STATE === 1) {
        $('#switch-list-cont').css('opacity', 0.5);
        openProjectNav();
        $('#task-list-cont').slideUp(300);
        $('#project-task-list-cont').fadeIn(300);
        $('#menu-icon').fadeOut(100);
        LIST_CONT_STATE = 2;
      } else {
        CURRENT_PROJECT_ID = "";
        $('#project-tag-display').fadeOut(300);
        $('#delete-project-btn').fadeOut(300);
        $('#switch-list-cont').css('opacity', 1);
        loadTaskList(SESSION_STORE);
        $('#project-task-list-cont').slideUp(300);
        $('#project-task-list-cont ul').html("");
        $('#task-list-cont').fadeIn(300);
        LIST_CONT_STATE = 1;
        closeProjectNav();
        $('#menu-icon').fadeOut(300);
      }
    });
  });
}

var menu_icon_state = 0;
$(function () {
  $('#menu-icon').click(function () {
    if (menu_icon_state === 1) {
      closeProjectNav();
      $(this).fadeOut(300);
      menu_icon_state = 0;
    } else {
      openProjectNav();
      $(this).fadeOut(300);
      menu_icon_state = 1;
    }
  });
});

function showMainTaskListCont() {
  $('#project-tag-display').fadeOut(300);
  $('#delete-project-btn').fadeOut(300);
  $('#switch-list-cont').css('opacity', 1);
  $('#project-task-list-cont').slideUp(300);
  $('#project-task-list-cont ul').html("");
  loadTaskList(SESSION_STORE);
  $('#task-list-cont').fadeIn(300);
  $('#menu-icon').fadeOut(300);
  LIST_CONT_STATE = 1;
}

function getTaskTemplate(taskId, taskText, date, endTime) {
  var taskNode = '<li class="list-group-item" id="' + taskId + '" status="false">' +
    '<img id="task-complete-icon" src="./assets/images/checked.svg" />' +
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

$(function () {
  $('#close-task-time-limit-modal').click(function () {
    var day = $('#task-time-input-day').val().trim();
    var month = $('#task-time-input-month').val().trim();
    var year = $('#task-time-input-year').val().trim();
    var hour = $('#task-time-input-hour').val().trim();
    var minute = $('#task-time-input-minute').val().trim();
    var second = $('#task-time-input-second').val().trim();

    var endTime = new Date(year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second).getTime();
    var taskId = $(this).attr('task-id').toString();
    if ($('#remove-time-check input').prop('checked')) {
      endTime = 0;
    }

    ($(this).attr('task-type').toString() === 'main') ? addMainTaskTimeLimit(taskId, endTime) : addProjectTaskTimeLimit(taskId, endTime);
  });
});

$(function () {
  setInterval(function () {
    setTaskTimeLeft();
  }, 2000);
});

function setTaskTimeLeft() {
  var units = countdown.YEARS | countdown.MONTHS | countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS;

  if (LIST_CONT_STATE === 1) {
    for (var i = 0; i < TASK_LIST.length; i++) {
      var info = TASK_LIST[i].split(":");
      var node = $('#' + info[0] + ' span .task-end-time');
      if (info[1] === "0" || info[1] === "") {
        node.text("");
        if ($('#' + info[0]).attr('status') === 'true') {
          $('#' + info[0]).css('border', '2px solid rgba(61, 199, 52, 0.43)');
        } else {
          $('#' + info[0]).css('border', 'none');
        }
      } else {
        var dateStart = new Date();
        var dateEnd = new Date(parseInt(info[1]));
        var timeString = dateStart < dateEnd ? (countdown(new Date(), new Date(parseInt(info[1])), units).toString()) : "Time over";
        if ($('#' + info[0]).attr('status') === 'true') {
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
  } else {
    for (var i = 0; i < PROJECT_TASK_LIST.length; i++) {
      var info = PROJECT_TASK_LIST[i].split(":");
      var node = $('#' + info[0] + ' span .task-end-time');
      if (info[1] === "0" || info[1] === "") {
        node.text("");
        if ($('#' + info[0]).attr('status') === 'true') {
          $('#' + info[0]).css('border', '2px solid rgba(61, 199, 52, 0.43)');
        } else {
          $('#' + info[0]).css('border', 'none');
        }
      } else {
        var dateStart = new Date();
        var dateEnd = new Date(parseInt(info[1]));
        var timeString = dateStart < dateEnd ? (countdown(new Date(), new Date(parseInt(info[1])), units).toString()) : "Time over";
        if ($('#' + info[0]).attr('status') === 'true') {
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
}

/* Attaching click listeners on various options of the task. */
function attachTaskOptionBtnListener() {
  $(function () {
    /* Unbind the previous ones. */
    $('.delete-task-btn').unbind('click');
    $('.complete-task-btn').unbind('click');
    $('.add-time-limit-btn').unbind('click');

    /* Attach new ones. */
    $('.delete-task-btn').click(function () {
      // Remove error message if add task modal is open.
      $('#task-input-error-box').text("").slideUp(300).css('color', 'black');
      var nodeId = $(this).parent().parent().parent().attr('id');
      $('#' + nodeId).remove();
      LIST_CONT_STATE === 1 ? deleteTaskFromStore(SESSION_STORE, nodeId) : deleteProjectTaskFromStore(SESSION_STORE, nodeId);
    });

    $('.complete-task-btn').click(function () {
      $('#task-input-error-box').text("").slideUp(300).css('color', 'black');
      var nodeId = $(this).parent().parent().parent().attr('id');
      if ($(this).attr('state') === "false") {
        $(this).attr('state', 'true');
        $('#' + nodeId).attr('status', 'true');
        $('#' + nodeId + ' .task-text').css('opacity', '0.5');
        $(this).html('<span><i class="fa fa-check"></i></span>Undone task');
        $(this).parent().parent().parent().children('img').fadeIn(300);
        LIST_CONT_STATE === 1 ? updateTaskCompleteInStore(SESSION_STORE, nodeId, true) : updateProjectTaskCompleteInStore(SESSION_STORE, nodeId, true);
      } else {
        $(this).attr('state', 'false');
        $('#' + nodeId).attr('status', 'false');
        $('#' + nodeId + ' .task-text').css('opacity', '1');
        $(this).html('<span><i class="fa fa-check"></i></span>Complete task');
        $(this).parent().parent().parent().children('img').fadeOut(300);
        LIST_CONT_STATE === 1 ? updateTaskCompleteInStore(SESSION_STORE, nodeId, false) : updateProjectTaskCompleteInStore(SESSION_STORE, nodeId, false);
      }
    });

    $('.add-time-limit-btn').click(function () {
      var nodeId = $(this).parent().parent().parent().attr('id');
      $('#close-task-time-limit-modal').attr('task-id', nodeId);
      $('#close-task-time-limit-modal').attr('task-type', LIST_CONT_STATE === 1 ? 'main' : 'project');
    });
  });
}

function connectToServer() {
  $('#connection-tracker-cont').fadeIn(100);

  let servers = [
    'http://127.0.0.1:7910/poll', 'http://192.168.1.2:7910/poll', 'http://192.168.1.3:7910/poll', 'http://192.168.1.4:7910/poll', 
    'http://192.168.1.5:7910/poll', 'http://192.168.1.6:7910/poll', 'http://192.168.1.7:7910/poll', 'http://192.168.1.8:7910/poll'
  ];
  let availableServer = [];

  async.every(servers, function (serverUrl, callback) {
    sendRequest(serverUrl, function (response) {
      if (response.status) {
        availableServer.push(response.url);
      }

      callback(null, true);
    });
  }, function (err, response) {
    $('#connection-tracker-cont div').fadeOut(10);
    $('#connection-tracking-icon').fadeIn(0);
    if (availableServer.length > 0) {
      CONNECTION_STATE = true;
      TASKING_SERVER_URL = availableServer[0];
      $('#connection-tracking-icon i').addClass('fa fa-check');
      $('#connection-tracking-message').text('Connected.');
      setTimeout(function () {
        $('#connection-tracker-cont').fadeOut(500);
      }, 4000);
    } else {
      $('#connection-tracking-icon i').addClass('fa fa-times');
      $('#connection-tracking-message').text('No active server available.');
      $('#manual-connection-add').slideDown(300);
    }
  });
}

function sendRequest(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let response = JSON.parse(xhr.responseText);
        if (response.activity === 'up') {
          callback({
            "status": true,
            "url": url,
            "systemType": response.systemType
          });
        } else {
          callback({ "status": false });
        }
      } else {
        callback({ "status": false });
      }
    }
  };

  xhr.open('GET', url, true);
  xhr.timeout = 5000;
  xhr.send(null);
}

$(function () {
  $('#manual-connection-add-btn').click(function () {
    let url = $('#manual-connection-add input').val().trim();
    // Add URL regex check.
    if (url.length < 1) {
      $('#manual-connection-error-badge').fadeIn(100);
      $('#manual-connection-error-badge').text("Nothing entered");
      return;
    }
    $('#manual-connection-error-badge').fadeOut(100);
    $('#connection-tracker-cont div').fadeIn(10);
    $('#manual-connection-add').slideUp(300);
    $('#connection-tracking-icon i').removeClass('fa fa-times');
    $('#connection-tracking-icon').fadeOut(0);
    $('#connection-tracking-message').text('Checking for the server at: ' + url);
    sendRequest(url, function (response) {
      if (response.status) {
        CONNECTION_STATE = true;
        TASKING_SERVER_URL = url;
        $('#connection-tracking-icon i').addClass('fa fa-check');
        $('#connection-tracking-icon').fadeIn(10);
        $('#connection-tracking-message').text('Connected.');
        $('#manual-connection-add').slideUp(100);
        setTimeout(function () {
          $('#connection-tracker-cont').fadeOut(500);
        }, 4000);
      } else {
        $('#connection-tracking-icon i').addClass('fa fa-times');
        $('#connection-tracking-icon').fadeIn(10);
        $('#connection-tracking-message').text('Server did not respond');
        $('#manual-connection-add').slideDown(300);
      }
      $('#connection-tracker-cont .loader').fadeOut(10);        
    });
  });
});
