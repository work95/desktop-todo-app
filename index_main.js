const electron = require('electron');
const currentWindow = electron.remote.getCurrentWindow();

const fs = require('fs');
const logger = require('tracer').colorConsole();

window.$ = window.jQuery = require('./assets/js/jquery-3.2.1.min.js');

var NEXT_USER_ID = 0;
var SESSION_STORE = "";

/* Remove the loading screen. */
function removeLoadingScreen() {
  $('#loading-screen').fadeOut(1200);
}

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
        NEXT_USER_ID = data.toString().trim();
      }
    });
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

$(function () {
  $('#add-task-btn').click(function () {
    $('#task-add-input-box').slideDown();
    $('#task-text-input').focus();
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


/* To close, minimize, maximize the browser window. */
$(function () {
  // Close window.
  $('#window-close-btn').click(function () {
    currentWindow.close();
  });

  // Minimize window.
  $('#window-minimize-btn').click(function () {
    currentWindow.minimize();
  });

  // Maximize window.
  $('#window-maximize-btn').click(function () {
    currentWindow.maximize();
  })
});
