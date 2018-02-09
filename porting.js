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


var async = require('async');
var request = require('request');

var commonModules = require('./common_modules');


/* Create a serialized format of the user's info. */
function portProfile(userId) {
  async.parallel({

    // Create a JSON of the projects (details + tasks).
    projects: function (callback) {
      var filePath = './data-store/user-store/' + userId + '/project-store-dir/project_list.txt';
      var projectList = commonModules.fs.readFileSync(filePath).toString().split('\n');
      projectList.pop();
      var projectInfo = [];
      var projectTasks = [];
      var projects = [];

      async.each(projectList, function (project, callback) {
        projectInfo = commonModules.fs.readFileSync('./data-store/user-store/' + userId + '/project-store-dir/' + project + '/project_info.txt').toString().trim().split(':');
        projects[projectInfo[0]] = {
          "projectId": projectInfo[0],
          "projectName": projectInfo[1],
          "projectTasks": []
        };

        var projectTaskList = commonModules.fs.readFileSync('./data-store/user-store/' + userId + '/project-store-dir/' + project + '/project_task_list.txt').toString().split('\n');
        projectTaskList.pop();

        async.each(projectTaskList, function (projectTaskId, callback) {
          var taskInfo = commonModules.fs.readFileSync('./data-store/user-store/' + userId + '/project-store-dir/' + project + '/' + projectTaskId + '.txt').toString().split('\n\n');
          projects[project]['projectTasks'].push({
            "taskId": projectTaskId,
            "taskComplete": taskInfo[0],
            "taskTimeLeft": taskInfo[1],
            "taskText": taskInfo[2]
          });
          callback(null);
        }, function(err) {
          if (err) {
            console.log('[Error]: ' + err);
          }
        });

        callback(null);

      }, function (err) {        
        if (err) {
          console.log('[Error]: ' + err);          
        } else {
          let projectList = [];
          for (let a in projects) {
            projectList.push(projects[a]);
          }
          callback(null, projectList);
        }
      });
    },

    // JSON for normal tasks.
    simpleTasks: function (callback) {
      var tasks = [];
      var taskList = commonModules.fs.readFileSync('./data-store/user-store/' + userId + '/task-store-dir/task_list.txt').toString().split('\n');
      taskList.pop();
      async.each(taskList, function (taskId, callback) {
        var taskInfo = commonModules.fs.readFileSync('./data-store/user-store/' + userId + '/task-store-dir/' + taskId + '.txt').toString().split('\n\n');
        tasks.push({
          "taskId": taskId,
          "taskComplete": taskInfo[0],
          "taskTimeLeft": taskInfo[1],
          "taskText": taskInfo[2]
        });
        callback(null);
      }, function (err) {
        if (err) {
          console.log('[Error]: ' + err);
        } else{
          callback(null, tasks);
        }
      });
    },

    // JSON for notes.
    notes: function (callback) {
      var notes = [];
      var noteList = commonModules.fs.readFileSync('./data-store/user-store/' + userId + '/note-store-dir/note_list.txt').toString().split('\n');
      noteList.pop();
      async.each(noteList, function (noteId, callback) {
        var noteInfo = commonModules.fs.readFileSync('./data-store/user-store/' + userId + '/note-store-dir/' + noteId + '.txt').toString().trim();
        notes.push({
          "noteId": noteId,
          "noteText": noteInfo
        });
        callback(null);
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
      var userInfo = commonModules.fs.readFileSync('./data-store/user-store/' + userId + '/user_info.txt').toString().split('\n');
      callback(null, {
        "userId": userId,
        "userName": userInfo[0],
        "userEmail": userInfo[1],
        "userPass": userInfo[2]
      });
    }

  }, function (err, result) {
    if(err) {
      console.log('[Error]: ' + err);
    } else {
      console.log('Profile ported sucessfully');
      
    }
  });
}

/* 
 * Fetch the user's info from a tasking server.
 */
function getProfile(userId) {}


/* 
 * Used for parsing JSON based details and create 
 * the desired directory structure.
 */
function setupProfile(userInfo) {}
