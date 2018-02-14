/**
 * @module This module is used for creating a serialized format of 
 * the whole user's data (profile info, tasks, projects, notes) and 
 * send them to the tasking server for portability.
 * 
 * THIS MODULE HASN'T BEEN TESTED.
 * NO SAFETY MECHANISMS APPLIED.
 * 
 * IT'S HIGHLY EXPERIMENTAL.
 */


const async = require('async');
const fs = require('fs');
const request = require('request');

/* Create a serialized format of the user's info. */
function portProfile(userId, mainCallback) {
  if (!CONNECTION_STATE) {
    return;
  }

  async.parallel({

    // Create a JSON of the projects (details + tasks).
    projects: function (callback) {
      let filePath = './data-store/user-store/' + userId + '/project-store-dir/project_list.txt';
      let projectList = [];
      fs.readFile(filePath, function (err, data) {
        if (err) {
          logging.logError('[Error] porting.js (31): ' + err);
        } else {
          projectList = data.toString().split('\n');
          projectList.pop();

          let projectInfo = [];
          let projectTasks = [];
          let projects = [];
          async.each(projectList, function (project, callback) {
            fs.readFile('./data-store/user-store/' + userId + '/project-store-dir/' + project + '/project_info.txt', function (err, data) {
              if (err) {
                logging.logError('[Error] porting.js (42): ' + err);
              } else {
                projectInfo = data.toString().trim().split(':');
                projects[projectInfo[0]] = {
                  "projectId": projectInfo[0],
                  "projectName": projectInfo[1],
                  "projectTasks": []
                };
        
                let projectTaskList = [];
                fs.readFile('./data-store/user-store/' + userId + '/project-store-dir/' + project + '/project_task_list.txt', function (err, data) {
                  if (err) {
                    logging.logError('[Error] porting.js (54): ' + err);
                  } else {
                    projectTaskList = data.toString().split('\n');
                    projectTaskList.pop();
                    async.each(projectTaskList, function (projectTaskId, callback) {
                      let taskInfo = [];
                      fs.readFile('./data-store/user-store/' + userId + '/project-store-dir/' + project + '/' + projectTaskId + '.txt', function (err, data) {
                        if (err) {
                          logging.logError('[Error] porting.js (62): ' + err);
                        } else {
                          taskInfo = data.toString().split('\n\n');
                          projects[project]['projectTasks'].push({
                            "taskId": projectTaskId,
                            "taskComplete": taskInfo[0],
                            "taskTimeLeft": taskInfo[1],
                            "taskText": taskInfo[2]
                          });
                          callback(null);
                        }
                      });
                    }, function(err) {
                      if (err) {
                        logging.logError('[Error] porting;.js (76): ' + err)
                      } else {
                        callback(null);
                      }
                    });
                  }
                });
              }
            });
          }, function (err) {        
            if (err) {
              logging.logError('[Error] porting;.js (87): ' + err)
            } else {
              let projectList = [];
              for (let a in projects) {
                projectList.push(projects[a]);
              }
              callback(null, projectList);
            }
          });

        }
      });
    },

    // JSON for normal tasks.
    simpleTasks: function (callback) {
      let tasks = [];
      let taskList = [];
      fs.readFile('./data-store/user-store/' + userId + '/task-store-dir/task_list.txt', function (err, data) {
        if (err) {
          logging.logError('[Error] porting.js (107): ' + err);
        } else {
          taskList = data.toString().split('\n');
          taskList.pop();
          async.each(taskList, function (taskId, callback) {
            let taskInfo = [];
            fs.readFile('./data-store/user-store/' + userId + '/task-store-dir/' + taskId + '.txt', function (err, data) {
              if (err) {
                logging.logError('[Error] porting.js (111): ' + err);
              } else {
                taskInfo = data.toString().split('\n\n');
                tasks.push({
                  "taskId": taskId,
                  "taskComplete": taskInfo[0],
                  "taskTimeLeft": taskInfo[1],
                  "taskText": taskInfo[2]
                });
                callback(null);
              }
            });
          }, function (err) {
            if (err) {
              console.log('[Error]: ' + err);
            } else{
              callback(null, tasks);
            }
          });
        }
      });
    },

    // JSON for notes.
    notes: function (callback) {
      let notes = [];
      let noteList = fs.readFileSync('./data-store/user-store/' + userId + '/note-store-dir/note_list.txt').toString().split('\n');
      noteList.pop();
      async.each(noteList, function (noteId, callback) {
        let noteInfo = "";
        fs.readFile('./data-store/user-store/' + userId + '/note-store-dir/' + noteId + '.txt', function (err, data) {
          if (err) {
            logging.logError('[Error] porting.js (107): ' + err);
          } else {
            noteInfo = data.toString().trim();
            notes.push({
              "noteId": noteId,
              "noteText": noteInfo
            });
            callback(null);
          }
        });
      }, function (err) {
        if (err) {
          console.log('[Error]: ' + err);
        } else {
          callback(null, notes);
        }
      });
    },

    // JSON for user's info.
    userInfo: function (callback) {
      let userInfo = [];
      fs.readFile('./data-store/user-store/' + userId + '/user_info.txt', function (err, data) {
        if (err) {
          logging.logError('[Error] porting.js (123): ' + err);
        } else {
          userInfo = data.toString().split('\n');
          callback(null, {
            "userId": userId,
            "userName": userInfo[0],
            "userEmail": userInfo[1],
            "userPass": userInfo[2]
          });
        }
      });
    },

    logTime: function(callback) {
      callback(null, {
        "portingTime": new Date().getTime().toString()
      });
    }

  }, function (err, result) {
    if(err) {
      console.log('[Error]: ' + err);
    } else {
      console.log('Profile ported sucessfully');
      console.log(result);
      sendRequest((TASKING_SERVER_URL + 'portProfile'), 'POST', JSON.stringify({ "profile": result }), function (response) {
        console.log(response);
      });

      // In case porting result is not important, callback will not be invoked.
      if (mainCallback !== undefined && mainCallback !== null) {
        mainCallback(result);
      }
    }
  });
}

/* 
 * Fetch the user's info from a tasking server.
 */
function getProfile(userId, callback) {
  sendRequest((TASKING_SERVER_URL + 'getProfile'), 'POST', JSON.stringify({ "userId": userId }), function (response) {
    callback(JSON.parse(response));
  });
}

/* 
 * Used for parsing JSON based details and create 
 * the desired directory structure.
 */
function setupProfile(userInfo) {
  if (userInfo === null || userInfo === undefined) {
    return;
  }

  let userId = userInfo['userInfo']['userId'];

  if (!fs.existsSync('./data-store')) {
    fs.mkdirSync('./data-store/');
  }
  
  fs.writeFileSync('./data-store/last_login.txt', userId);
  
  if (!fs.existsSync('./data-store/user-store/')) {
    fs.mkdirSync('./data-store/user-store/');
  }

  fs.appendFileSync('./data-store/user-store/user_list.txt', userInfo['userInfo']['userEmail'] + ":" + userId + ',');
  
  if (!fs.existsSync('./data-store/user-store/' + userId)) {
    fs.mkdirSync('./data-store/user-store/' + userId);
  }

  fs.writeFileSync('./data-store/user-store/' + userId + '/user_info.txt', userInfo['userInfo']['userName'] + '\n' + userInfo['userInfo']['userEmail'] + '\n' + userInfo['userInfo']['userPass']);
  
  if (!fs.existsSync('./data-store/user-store/' + userId + '/task-store-dir/')) {
    fs.mkdirSync('./data-store/user-store/' + userId + '/task-store-dir/');
  }

  if (!fs.existsSync('./data-store/user-store/' + userId + '/project-store-dir/')) {
    fs.mkdirSync('./data-store/user-store/' + userId + '/project-store-dir/');
  }

  if (!fs.existsSync('./data-store/user-store/' + userId + '/note-store-dir/')) {
    fs.mkdirSync('./data-store/user-store/' + userId + '/note-store-dir/');
  }


  if (userInfo['projects'].length > 0) {
    fs.writeFileSync('./data-store/user-store/' + userId + '/project-store-dir/' + '/project_list.txt', "");
    for (let i = 0; i < userInfo['projects'].length; i++) {
      let projectId = userInfo['projects'][i]['projectId'];
      if (!fs.existsSync('./data-store/user-store/' + userId + '/project-store-dir/' + projectId)) {
        fs.mkdirSync('./data-store/user-store/' + userId + '/project-store-dir/' + projectId);
      }
      fs.writeFileSync('./data-store/user-store/' + userId + '/project-store-dir/' + projectId + '/project_info.txt', projectId + ":" + userInfo['projects'][i]['projectName']);
      fs.appendFileSync('./data-store/user-store/' + userId + '/project-store-dir/' + '/project_list.txt', projectId + '\n');
      
      fs.writeFileSync('./data-store/user-store/' + userId + '/project-store-dir/' + projectId + '/project_task_list.txt', "");
      for (let j = 0; j < userInfo['projects'][i]['projectTasks'].length; j++) {
        let taskInfo = userInfo['projects'][i]['projectTasks'][j];
        fs.appendFileSync('./data-store/user-store/' + userId + '/project-store-dir/' + projectId + '/project_task_list.txt', taskInfo['taskId'] + '\n');
        fs.writeFileSync('./data-store/user-store/' + userId + '/project-store-dir/' + projectId + '/' + taskInfo['taskId'] + '.txt', taskInfo['taskComplete'] + '\n\n' + taskInfo['taskTimeLeft'] + '\n\n' + taskInfo['taskText']);
      }
    }
  }

  if (userInfo['simpleTasks'].length > 0) {
    fs.writeFileSync('./data-store/user-store/' + userId + '/task-store-dir/task_list.txt', "");
    for (let i = 0; i < userInfo['simpleTasks'].length; i++) {
      let taskInfo = userInfo['simpleTasks'][i];
      fs.appendFileSync('./data-store/user-store/' + userId + '/task-store-dir/task_list.txt', taskInfo['taskId'] + '\n');
      fs.writeFileSync('./data-store/user-store/' + userId + '/task-store-dir/' + taskInfo['taskId'] + '.txt', taskInfo['taskComplete'] + '\n\n' + taskInfo['taskTimeLeft'] + '\n\n' + taskInfo['taskText']);
    }
  }

  if (userInfo['notes'].length > 0) {
    fs.writeFileSync('./data-store/user-store/' + userId + '/note-store-dir/note_list.txt', "");
    for (let i = 0; i < userInfo['notes'].length; i++) {
      let noteInfo = userInfo['notes'][i];
      fs.appendFileSync('./data-store/user-store/' + userId + '/note-store-dir/note_list.txt', noteInfo['noteId'] + '\n');
      fs.writeFileSync('./data-store/user-store/' + userId + '/note-store-dir/' + noteInfo['noteId'] + '.txt', noteInfo['noteText']);
    }
  }
}

function sendRequest(url, method, body, callback) {
  let options = {
    uri: url,
    method: method,
    headers: {
      'content-type': 'application/json'
    },
    body: body
  };

  request(options, function (err, response, body) {
    if (err) {
      console.log(err);
    } else {
      callback(body);
    }
  });
}


module.exports.portProfile = portProfile;
module.exports.getProfile = getProfile;
module.exports.setupProfile = setupProfile;
