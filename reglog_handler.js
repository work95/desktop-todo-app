const USER_LIST_FILE_PATH = './data-store/user-store/user_list.txt';

/* For registering the user. */
function registerUser(name, email, password, callback) {

  // Check for existence of '/data-store/user-store' directory.
  if (!fs.existsSync('./data-store')) {
    fs.mkdirSync('./data-store');
  } 
  
  if (!fs.existsSync('./data-store/user-store/')) {
    fs.mkdirSync('./data-store/user-store/');
    fs.writeFileSync('./data-store/user-store/next_user_id.txt', "0");
  } 
  
  if (!fs.existsSync('./data-store/user-store/next_user_id.txt')) {
    fs.writeFileSync('./data-store/user-store/next_user_id.txt', "0");
    NEXT_USER_ID = 0;
  } else {
    NEXT_USER_ID = parseInt(fs.readFileSync('./data-store/user-store/next_user_id.txt').toString().trim());
  }

  if (!fs.existsSync('./data-store/user-store/user_list.txt')) {
    fs.writeFileSync('./data-store/user-store/user_list.txt');
  }

  /* See if the user already exists in the record or not. */
  fs.readFile(USER_LIST_FILE_PATH, function (err, data) {
    if (err) {
      logging.logError('reglog_handler.js (20): ' + err);
      callback({
        "status": "null"
      });
    } else {
      let userList = data.toString().split(',').pop();
      for (let i = 0; i < userList.length; i++) {
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
  let file = fs.appendFile(USER_LIST_FILE_PATH, (email + ":" + NEXT_USER_ID) + ",", function (err) {
    if (err) {
      logging.logError('reglog_handler.js (40): ' + err);
      callback({
        "status": null
      });
    } else {
      SESSION_STORE = NEXT_USER_ID;

      /* Create a directory for user. */
      fs.mkdirSync('./data-store/user-store/' + NEXT_USER_ID);
    
      // Add a file for user information.
      let userInfo = name + "\n" + email + "\n" + password;
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
      let userList = data.toString().split(',');
      userList.pop();
      if (userList.length > 0) {
        for (let i = 0; i < userList.length; i++)  {

          // Split the user's email from the ID.
          let userInfo = userList[i].split(":");
          if (userInfo[0] === email) {
            let userId = userInfo[1]
            // Read the user's information to fetch the password.
            fs.readFile('./data-store/user-store/' + userInfo[1] + '/user_info.txt', function (err, data) {
              if (err) {
                logging.logError('reglog_handler.js (113): ' + err);
                callback({
                  "status": null
                });
              } else {
                // Compare the passwords.
                let completeInfo = data.toString().split("\n");
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
      } else {
        // No users registered in record.
        callback({
          "status": false,
          "error": "NO_SUCH_USER"
        });
      }
    }
  });
}

function searchUser(email, callback) {
  if (email !== null || email !== undefined || email !== "") {
    async.parallel({
      online: function (callback) {
        if (CONNECTION_STATE) {
          sendRequest(TASKING_SERVER_URL + '/getUser', function (response) {
            callback(null, response);
          });
        } else {
          callback(null, {
            "status": false
          });
        }
      }, 

      offline: function (callback) {
        var userList = fs.readFileSync('./data-store/user-store/user_list.txt').toString().split(',');
        for (let i = 0; i < userList.length; i++) {
          let userInfo = userList[i].split(":");
          if (userInfo[0] === email) {
            callback(null, {
              "status": true,
              "userId": userInfo[1]
            });
          } else {
            callback(null, {
              "status": false
            });
          }
        }
      }
    }, function (err, response) {
      if (response['online']['status']) {
        callback(response['online']);
      } else if (response['offline']['status']) {
        callback(response['offline']);
      } else {
        callback({ 'status': false });
      }
    });
  }
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
        let message = '';
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
        addLastLoginSession(SESSION_STORE);
        attachTaskListSwitchListener();
        attachWindowKeyListener();
        attachAddTaskBtnListener();     
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
        let message = '';
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
        $('#task-list-cont').slideDown(300);
        $('#reglog-btn').fadeOut(10);
        $('#sign-out-btn').fadeIn(300);
        $('#switch-list-cont').css('opacity', 1);
        closeRegLogPane();
        $('#add-task-btn').removeClass('disabled');
        $('#user-name-display h2').addClass('float-header-name');
        $('header').addClass('red darken-1');
        $('header').removeClass('purple darken-1');

        loadTaskList(SESSION_STORE);
        loadProjects();
        addLastLoginSession(SESSION_STORE);
        attachTaskListSwitchListener();
        attachWindowKeyListener();
        attachAddTaskBtnListener();
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
let activeTab = "pane2";
$(function () {
  $('.nav-item').click(function () {
    let tabId = $(this).children('a').attr('ref');
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
    $(window).unbind('keydown');  
    $('#add-task-btn').unbind('click');  
  });
});

$(function () {
  $('#check-email-btn').click(function () {
    let email = $('#login-email-cont input').val().trim();

    if (email.length < 1) {
      $('#log-email-error').text("Email not entered").slideDown(200);
      return;
    } else if (email.match(/[\d\w]+[@][\d\w]+.(com|co[.]in)/ig) === null) {
      $('#log-email-error').text('Email pattern incorrect').slideDown(200);
      return;
    } else {
      $('#log-email-error').text("").slideUp(200);
    }

    searchUser(email, function (response) {
      if (response.status) {
        $('#email-tag').text(response.email).fadeIn(100);
        $('#check-email-btn').fadeOut(100);
        $('#login-btn').fadeIn(300).css('display', 'inline-block');
        $('#login-email-cont').fadeOut(100);
        $('#login-pass-cont').fadeIn(300);
        $('#login-btn-badge').text('').fadeOut(0);
      } else {
        $('#login-btn-badge').text('No user found. Sign up now.').fadeIn(100);
      }
    });
  });
});

function logOut() {
  clearRegLogInputForms();
  removeLastLoginSession();
  closeProjectNav();
  
  $('#user-name-display h2').text("Todo");
  $('#sign-out-btn').fadeOut(10);
  $('#reglog-btn').fadeIn(300);
  $('#task-list-cont ul').html("");
  $('#add-task-btn').addClass('disabled');
  $('#user-name-display h2').removeClass('float-header-name');
  $('header').addClass('purple darken-1');
  $('header').removeClass('red darken-1');  
  $('#project-tag-display').fadeOut(300);
  $('#delete-project-btn').fadeOut(300);
  $('#switch-list-cont').css('opacity', 0.5);
  $('#switch-list-cont').unbind('click');
  $('#project-task-list-cont').slideUp(300);
  $('#project-task-list-cont ul').html("");
  $('#menu-icon').fadeOut(300);

  SESSION_STORE = "";  
  CURRENT_PROJECT_ID = "";
  LIST_CONT_STATE = 1;
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
  let filePath = './data-store/last_login.txt';
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
  }
  fs.writeFileSync(filePath, sessionId);
}

function removeLastLoginSession() {
  let filePath = './data-store/last_login.txt';
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
    return;
  }
  fs.writeFileSync(filePath, "");
}

function loadLastLoginSession() {
  let filePath = './data-store/last_login.txt';
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
    return null;
  }

  // Load the session store.
  SESSION_STORE = fs.readFileSync(filePath).toString().trim();
  if (SESSION_STORE === undefined || SESSION_STORE === null || SESSION_STORE === "" || SESSION_STORE === "undefined") {
    return null;
  }
  $('#user-name-display h2').text(splitName(fs.readFileSync('./data-store/user-store/' + SESSION_STORE + '/user_info.txt').toString().trim().split("\n")[0]));
  $('#reglog-btn').fadeOut(10);
  $('#add-task-btn').removeClass('disabled');
  $('#sign-out-btn').fadeIn(300);
  $('header').addClass('red darken-1');
  $('header').removeClass('purple darken-1');
  $('#user-name-display h2').addClass('float-header-name');
  $('#switch-list-cont').css('opacity', 1);
  loadTaskList(SESSION_STORE);
  attachTaskListSwitchListener();
  attachWindowKeyListener();
  attachAddTaskBtnListener();
}

function splitName(name) {
  let separate = name.split(" ");
  let shortName = "";
  for (let i = 0; i < separate.length; i++) {
    if (separate[i] === "undefined" || separate[i] === "") {
    } else {
      shortName += separate[i][0];
    }
  }
  return shortName;
}
