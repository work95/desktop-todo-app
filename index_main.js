const electron = require('electron');
const currentWindow = electron.remote.getCurrentWindow();

const fs = require('fs');
const logger = require('tracer').colorConsole();
const countdown = require('countdown');

const logging = require('./logging');

window.$ = window.jQuery = require('./assets/js/jquery-3.2.1.min.js');


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

$(function () {
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
  var taskNode = '<li class="list-group-item" id="' + taskId + '">' +
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
  }, 1000);
});

function setTaskTimeLeft() {
  if (LIST_CONT_STATE === 1) {
    for (var i = 0; i < TASK_LIST.length; i++) {
      var info = TASK_LIST[i].split(":");
      var timeString = "";
      if (info[1] === "0" || info[1] === "") {
        timeString = "";
      } else {
        var dateStart = new Date();
        var dateEnd = new Date(parseInt(info[1]));
        timeString = dateStart < dateEnd ? (countdown(new Date(), new Date(parseInt(info[1]))).toString()) : "Time over";
      }
      $('#' + info[0] + ' span .task-end-time').text(timeString);
    }
  } else {
    for (var i = 0; i < PROJECT_TASK_LIST.length; i++) {
      var info = PROJECT_TASK_LIST[i].split(":");
      var timeString = "";
      if (info[1] === "0" || info[1] === "") {
        timeString = "";
      } else {
        var dateStart = new Date();
        var dateEnd = new Date(parseInt(info[1]));
        timeString = dateStart < dateEnd ? (countdown(new Date(), new Date(parseInt(info[1]))).toString()) : "Time over";
      }
      $('#' + info[0] + ' span .task-end-time').text(timeString);
    }
  }
}
