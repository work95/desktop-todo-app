const USER_LIST_FILE_PATH = './data-store/user-store/user_list.txt';

/* For registering the user. */
function registerUser(name, email, password, callback) {

  // Check for existence of '/data-store/user-store' directory.
  if (!fs.existsSync('./data-store/user-store/')) {
    fs.mkdirSync('./data-store/user-store/');
    fs.writeFileSync('./data-store/user-store/next_user_id.txt', "0");
  } else if (!fs.existsSync('./data-store/user-store/next_user_id.txt')) {
    fs.writeFileSync('./data-store/user-store/usernext_user_id.txt', "0");
    NEXT_USER_ID = 0;
  } else {
    NEXT_USER_ID = parseInt(fs.readFileSync('./data-store/user-store/next_user_id.txt').toString().trim());
  }

  /* See if the user already exists in the record or not. */
  fs.readFile(USER_LIST_FILE_PATH, function (err, data) {
    if (err) {
      logging.logError('reglog_handler.js (20): ' + err);
      callback({
        "status": "null"
      });
    } else {
      var userList = data.toString().split(',').pop();
      for (var i = 0; i < userList.length; i++) {
        if (email === userList[i].split(":")[0]) {
          callback({
            "status": false,
            "error": "USER_PRESENT"
          });
        }
      }
    }
  });

  /* Enter the new user in the user list. */
  var file = fs.appendFile(USER_LIST_FILE_PATH, (email + ":" + NEXT_USER_ID) + ",", function (err) {
    if (err) {
      logging.logError('reglog_handler.js (40): ' + err);
      callback({
        "status": null
      });
    } else {

      /* Create a directory for user. */
      fs.mkdirSync('./data-store/user-store/' + NEXT_USER_ID);
    
      // Add a file for user information.
      var userInfo = name + "\n" + email + "\n" + password;
      fs.appendFile('./data-store/user-store/' + NEXT_USER_ID + '/user_info.txt', userInfo, function (err) {
        if (err) {
          logging.logError('reglog_handler.js (53): ' + err);
          callback({
            "status": null
          });
        } else {
          fs.appendFile('./data-store/user-store/' + NEXT_USER_ID + '/user_task_list.txt', "", function (err) {
            if (err) {
              logging.logError('reglog_handler.js (60): ' + err);
              callback({
                "status": null
              });
            } else {
              // Update the 'NEXT_USER_ID' in file.
              fs.writeFileSync('./data-store/user-store/next_user_id.txt', (++NEXT_USER_ID).toString());
              callback({
                "status": true
              });
            }
          });
        }
      });
    }
  });
}

/* For signing the user in by checking his/her credentials. */
function loginUser(email, password, callback) {
  if (!fs.existsSync('./data-store/user-store/')) {
    fs.mkdirSync('./data-store/user-store/');

    // Add the user list now.
    if (!fs.existsSync(USER_LIST_FILE_PATH)) {
      fs.writeFileSync(USER_LIST_FILE_PATH, "");
    }

    // Since there is no user found.
    callback({
      "status": false
    });
  }

  fs.readFile(USER_LIST_FILE_PATH, function (err, data) {
    if (err) {
      logging.logError('reglog_handler.js (96): ' + err);
      callback({
        "status": null
      });
    } else {
      // Get the users from the user list.
      var userList = data.toString().split(',');
      userList.pop();
      for (var i = 0; i < userList.length; i++)  {

        // Split the user's email from the ID.
        var userInfo = userList[i].split(":");
        if (userInfo[0] === email) {
          var userId = userInfo[1]
          // Read the user's information to fetch the password.
          fs.readFile('./data-store/user-store/' + userInfo[1] + '/user_info.txt', function (err, data) {
            if (err) {
              logging.logError('reglog_handler.js (113): ' + err);
              callback({
                "status": null
              });
            } else {
              // Compare the passwords.
              var completeInfo = data.toString().split("\n");
              if (password === completeInfo[2]) {
                // On success, return the name and ID of the user.
                callback({
                  "status": true,
                  "name": completeInfo[0],
                  "userId": userId
                });

              } else {
                // On failure, return a false status.
                callback({
                  "status": false,
                  "error": "WRONG_PASSWORD"
                });
              }
            }
          });
        } else {
          // Can't find the user in record.
          callback({
            "status": false,
            "error": "NO_SUCH_USER"
          });
        }
      }

      // No users registered in record.
      callback({
        "status": false,
        "error": "NO_SUCH_USER"
      });
    }
  });
}

/* Register button click listener. */
$(function () {
  $('#register-btn').click(function () {

    /* Do validation first. */
    if (!validateRegistrationForm()) {
      $('#reg-btn-badge').fadeOut(300).text("");
      return;
    }

    registerUser($('#orangeForm-name').val().trim(), $('#orangeForm-email').val().trim(), $('#orangeForm-pass').val().trim(), function (result) {
      if (result.status === null) {
        logging.logError('reglog_handler.js (167): ' + err);
        $('#reg-btn-badge').text("Internal Error. Try after sometime.").fadeIn(300);
      } else if (!result.status) {
        var message = '';
        if (result.error === "USER_PRESENT") {
          message = 'User already registered';
        }
        $('#reg-btn-badge').text(message).fadeIn(300);
      } else {
        $('#user-name-display h2').text(splitName($('#orangeForm-name').val().trim()));
        $('#add-task-btn').removeClass('disabled');
        $('#reglog-btn').fadeOut(10);
        $('#sign-out-btn').fadeIn(300);
        $('#user-name-display h2').addClass('float-header-name');
        $('header').addClass('red darken-1');
        $('header').removeClass('purple darken-1');
        closeRegLogPane();  
        addLastLoginSession();      
      }
    });
  });
});

/* Login button click listener. */
$(function () {
  $('#login-btn').click(function () {

    /* Do validation first. */
    if (!validateLoginForm()) {
      $('#login-btn-badge').fadeOut(300).text("");
      return;
    }

    loginUser($('#defaultForm-email').val().trim(), $('#defaultForm-pass').val().trim(), function (result) {
      if (result.status === null) {
        logging.logError('reglog_handler.js (202): ' + err);
        $('#login-btn-badge').text("Internal Error. Try after sometime.").fadeIn(300);
      } else if (!result.status) {
        var message = '';
        if (result.error === "WRONG_PASSWORD") {
          message = 'Email or password mismatch';
        } else {
          message = 'User not found';
        }
        $('#login-btn-badge').text(message).fadeIn(300);
      } else {
        $('#login-btn-badge').text("").fadeOut(300);
        // Store the session of the logged in user.
        SESSION_STORE = result.userId;
        $('#user-name-display h2').text(splitName(result.name));
        $('#reglog-btn').fadeOut(10);
        $('#sign-out-btn').fadeIn(300);
        closeRegLogPane();
        $('#add-task-btn').removeClass('disabled');
        $('#user-name-display h2').addClass('float-header-name');
        $('header').addClass('red darken-1');
        $('header').removeClass('purple darken-1');
        loadTaskList(SESSION_STORE);
        addLastLoginSession(SESSION_STORE);
        loadProjects();
      }
    });
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

/* Close the reglog pane. */
function closeRegLogPane() {
  document.getElementById("reglog-page").style.width = "0";
  $('#tab-cont').fadeOut(200);
  clearRegLogInputForms();
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

/* Sign out the user. */
$(function () {
  $('#sign-out-btn').click(function () {
    logOut();
  });
});

function logOut() {
  SESSION_STORE = "";
  $('#user-name-display h2').text("Todo");
  $('#sign-out-btn').fadeOut(10);
  $('#reglog-btn').fadeIn(300);
  $('#task-list-cont ul').html("");
  $('#add-task-btn').addClass('disabled');
  clearRegLogInputForms();
  removeLastLoginSession();
  $('#user-name-display h2').removeClass('float-header-name');
  $('header').addClass('purple darken-1');
  $('header').removeClass('red darken-1');
}

/* Reset the input forms of the reglog page along with their dropping error message boxes. */
function clearRegLogInputForms() {
  $('#orangeForm-name').val("");
  $('#orangeForm-email').val("");
  $('#orangeForm-pass').val("");
  $('#defaultForm-email').val("");
  $('#defaultForm-pass').val("");
  $('#reg-name-error').text("").slideDown(200);
  $('#reg-email-error').text("").slideDown(200);
  $('#reg-pass-error').text("").slideDown(200);
  $('#log-email-error').text("").slideDown(200);
  $('#log-pass-error').text("").slideDown(200);
}

function addLastLoginSession(sessionId) {
  var filePath = './data-store/last_login.txt';
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
  }
  fs.writeFileSync(filePath, sessionId);
}

function removeLastLoginSession() {
  var filePath = './data-store/last_login.txt';
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
    return;
  }
  fs.writeFileSync(filePath, "");
}

function loadLastLoginSession() {
  var filePath = './data-store/last_login.txt';
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "0");
    return null;
  }

  // Load the session store.
  SESSION_STORE = fs.readFileSync(filePath).toString().trim();
  if (SESSION_STORE === undefined || SESSION_STORE === null || SESSION_STORE === "") {
    return null;
  }
  $('#user-name-display h2').text(splitName(fs.readFileSync('./data-store/user-store/' + SESSION_STORE + '/user_info.txt').toString().trim().split("\n")[0]));
  $('#reglog-btn').fadeOut(10);
  $('#add-task-btn').removeClass('disabled');
  $('#sign-out-btn').fadeIn(300);
  $('header').addClass('red darken-1');
  $('header').removeClass('purple darken-1');
  $('#user-name-display h2').addClass('float-header-name');
  loadTaskList(SESSION_STORE);
}

function splitName(name) {
  var separate = name.split(" ");
  var shortName = "";
  for (var i = 0; i < separate.length; i++) {
    if (separate[i] === "undefined" || separate[i] === "") {
    } else {
      shortName += separate[i][0];
    }
  }
  return shortName;
}
