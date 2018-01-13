const USER_LIST_FILE_PATH = './data-store/user-store/user_list.txt';

/* For registering the user. */
function registerUser(name, email, password, callback) {

  // Check for existence of '/data-store/user-store' directory.
  if (!fs.existsSync('./data-store/user-store/')) {
    fs.mkdirSync('./data-store/user-store/');
  } 

  /* See if the user already exists in the record or not. */
  fs.readFile(USER_LIST_FILE_PATH, function (err, data) {
    if (err) {
      logger.warn('[Error]: ' + err);
      callback({
        "status": "null"
      });
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

  /* Enter the new user in the user list. */
  var file = fs.appendFile(USER_LIST_FILE_PATH, (email + ":" + NEXT_USER_ID) + ",", function (err) {
    if (err) {
      logger.warn('[Error]: ' + err);
      callback({
        "status": false
      });
    } else {
      logger.info('User ['  + email + '] registered');

      /* Create a directory for user. */
      fs.mkdirSync('./data-store/user-store/' + NEXT_USER_ID);
    
      // Add a file for user information.
      var userInfo = name + "\n" + email + "\n" + password;
      fs.appendFile('./data-store/user-store/' + NEXT_USER_ID + '/user_info.txt', userInfo, function (err) {
        if (err) {
          logger.warn('[Error]: ' + err);
          callback({
            "status": false
          });
        } else {
          fs.appendFile('./data-store/user-store/' + NEXT_USER_ID + '/user_task_list.txt', "", function (err) {
            if (err) {
              logger.warn('[Error]: ' + err);
              callback({
                "status": false
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
  }

  fs.readFile(USER_LIST_FILE_PATH, function (err, data) {
    if (err) {
      logger.warn('[Error]: ' + err);
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
          // Read the user's information to fetch the password.
          fs.readFile('./data-store/user-store/' + userInfo[1] + '/user_info.txt', function (err, data) {
            if (err) {
              logger.warn('[Error]: ' + err);
              callback({
                "status": null
              });
            } else {
              // Compare the passwords.
              var completeInfo = data.toString().split("\n");
              if (password === completeInfo[2]) {
                // On success, return the name of the user.
                callback({
                  "status": true,
                  "name": completeInfo[0],
                  "userId": userInfo[1]
                });

              } else {
                // On failure, return a false status.
                callback({
                  "status": false
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
    if (!validateRegistrationForm()) {
      return;
    }

    registerUser($('#orangeForm-name').val().trim(), $('#orangeForm-email').val().trim(), $('#orangeForm-pass').val().trim(), function (result) {
      if (result.status === null) {
        $('#reg-btn-badge').text("Internal Error").fadeIn(300);
      } else if (!result.status) {
        $('#reg-btn-badge').text("User not found").fadeIn(300);
      } else {
        $('#user-name-display h2').text("Hi. " + $('#orangeForm-name').val().trim());
        $('#add-task-btn').removeClass('disabled');
        $('#delete-task-btn').removeClass('disabled');
        $('#reglog-btn').fadeOut(10);
        $('#sign-out-btn').fadeIn(300);
        closeRegLogPane();        
      }
    });
  });
});

/* Login button click listener. */
$(function () {
  $('#login-btn').click(function () {

    /* Do validation first. */
    if (!validateLoginForm()) {
      return;
    }

    loginUser($('#defaultForm-email').val().trim(), $('#defaultForm-pass').val().trim(), function (result) {
      if (result.status === null) {
        $('#login-btn-badge').text("Internal Error").fadeIn(300);
      } else if (!result.status) {
        $('#login-btn-badge').text('User not found').fadeIn(300);
      } else {
        $('#login-btn-badge').text("").fadeOut(300);
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
    SESSION_STORE = "";
    $('#user-name-display h2').text("Todo");
    $('#sign-out-btn').fadeOut(10);
    $('#reglog-btn').fadeIn(300);
    $('#task-list-cont ul').html("");
    $('#add-task-btn').addClass('disabled');
    $('#delete-task-btn').addClass('disabled');
    clearRegLogInputForms();
  });
});

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
