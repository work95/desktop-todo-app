var PROJECT_LIST = [];
var PROJECT_TASK_LIST = [];

function addProject(projectName, projectId) {
  for (var i = 0;i < PROJECT_LIST.length; i++) {
    if (projectName.toLowerCase() === PROJECT_LIST[i].split(":")[1].toLowerCase()) {
      $('#project-input-error-box').text('Project already added!').slideDown(300);
      return;
    }
  }
  $('#project-list-cont').append('<a href="#" class="project-item" project-id="' + projectId + '">' + projectName + '</a>')
  var projectInfo = projectId + ":" + projectName;
  PROJECT_LIST.push(projectInfo);
  addProjectInStore(SESSION_STORE, projectInfo);
  attachProjectLinkListener();
}

function addProjectTask(taskText, taskId) {
  for (var i = 0; i < PROJECT_TASK_LIST.length; i++) {
    if (taskText.toLowerCase() === PROJECT_TASK_LIST[i].split(":")[1].toLowerCase()) {
      $('#task-input-error-box').text('Task already added!').slideDown(300);
      return;
    }
  }
  $('#project-task-list-cont ul').append('<li class="list-group-item" id="' + taskId + '"><img id="task-complete-icon" src="./assets/images/checked.svg" /><span class="task-text">' + taskText + '</span><div class="task-options-cont"><div class="dot-set dropdown" id="dropdownMenu2" data-toggle="dropdown" aria-expanded="false"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><div id="task-options-menu" class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu2"><a class="complete-task-btn" state="false" class="dropdown-item" href="#"><span><i class="fa fa-check"></i></span>Complete Task</a><a class="delete-task-btn" class="dropdown-item" href="#"><span><i class="fa fa-trash-alt"></i></span>Delete Task</a></div></div></li>');
  attachProjectTaskOptionBtnListener();

  var taskInfo = taskId + ":" + taskText;
  PROJECT_TASK_LIST.push(taskInfo);
  addProjectTaskInStore(SESSION_STORE, taskInfo);
}

function addProjectTaskInStore(userId, taskInfo) {
  var filePath = './data-store/user-store/' + userId + '/project-store-dir/';
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  var info = taskInfo.split(":");
  fs.appendFileSync(filePath + '/' + CURRENT_PROJECT_ID + '/project_task_list.txt', info[0] + '\n');
  fs.writeFileSync(filePath + '/' + CURRENT_PROJECT_ID + '/' + info[0] + '.txt', 'false\n\n' + info[1]);
}

function addProjectInStore(userId, projectInfo) {
  var filePath = './data-store/user-store/' + userId + '/project-store-dir/';
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  var info = projectInfo.split(":");
  fs.appendFileSync(filePath + '/' + 'project_list.txt', info[0] + '\n');
  fs.mkdirSync(filePath + '/' + info[0]);
  fs.writeFileSync(filePath + '/' + info[0] + '/project_info.txt', projectInfo);
}

/* To hide the error message below the input form when a key is pressed again. */
$(function () {
  $('#project-text-input').on('keydown', function (e) {
    if (e.keyCode === KeyCodes.ENTER) {

      // If control + enter is pressed more than once then show the error in red color.
      if ($('#project-input-error-box').text().length > 1) {
        $('#project-input-error-box').css('color', 'red');
      }
    } else if (e.keyCode === KeyCodes.CONTROL) {
      return;
    } else {
      $('#project-input-error-box').text("").slideUp(300).css('color', 'black');
    }
  });
});

function attachProjectLinkListener() {
  $(function () {
    $('.project-item').unbind('click');
    $('.project-item').click(function () {
      var projectId = $(this).attr('project-id').toString();
      var projectInfo = fs.readFileSync('./data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + projectId + '/project_info.txt').toString().split(":");

      loadProjectTasks(projectId);
      CURRENT_PROJECT_ID = projectId;
      closeProjectNav();
      $('#project-tag-display').text(projectInfo[1]).fadeIn(100);
    });
  });
}

function attachProjectTaskOptionBtnListener() {
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
    $('.complete-task-btn').unbind('click');

    // Attach again.
    $('.delete-task-btn').click(function () {
      // Remove error message if add task modal is open.
      $('#task-input-error-box').text("").slideUp(300).css('color', 'black');
      var nodeId = $(this).parent().parent().parent().attr('id');
      $('#' + nodeId).remove();
      deleteProjectTaskFromStore(SESSION_STORE, nodeId);
    });

    $('.complete-task-btn').click(function () {
      $('#task-input-error-box').text("").slideUp(300).css('color', 'black');
      var nodeId = $(this).parent().parent().parent().attr('id');
      if ($(this).attr('state') === "false") {
        $(this).attr('state', 'true');
        $('#' + nodeId + ' .task-text').css('opacity', '0.5');
        $(this).html('<span><i class="fa fa-check"></i></span>Undone task');
        $(this).parent().parent().parent().children('img').fadeIn(300);
        updateProjectTaskCompleteInStore(SESSION_STORE, nodeId, true);
      } else {
        $(this).attr('state', 'false');
        $('#' + nodeId + ' .task-text').css('opacity', '1');
        $(this).html('<span><i class="fa fa-check"></i></span>Complete task');
        updateProjectTaskCompleteInStore(SESSION_STORE, nodeId, false);
        $(this).parent().parent().parent().children('img').fadeOut(300);
      }
    });
  });
}

function updateProjectTaskCompleteInStore(userId, taskId, state) {
  var filePath = './data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + CURRENT_PROJECT_ID + '/' + taskId + '.txt';
  var taskInfo = fs.readFileSync(filePath).toString().split("\n\n");
  fs.writeFileSync(filePath, state + '\n\n' + taskInfo[1]);
}

function deleteProjectTaskFromStore(userId, taskId) {
  var filePath = './data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + CURRENT_PROJECT_ID + '/project_task_list.txt';
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
    fs.unlinkSync('./data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + CURRENT_PROJECT_ID + '/' + taskId + '.txt');
  }
}

function loadProjectTasks(projectId) {
  $('#project-task-list-cont ul').html("");
  var filePath = './data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + projectId + '/project_task_list.txt';
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
    return null;
  }
  var projectTaskList = fs.readFileSync(filePath).toString().split("\n");
  projectTaskList.pop();

  for (var i = 0; i < projectTaskList.length; i++) {
    var data = fs.readFileSync('./data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + projectId + '/' + projectTaskList[i] + '.txt').toString().split('\n\n');
    PROJECT_LIST.push(projectTaskList[i] + ":" + data[1]);
    $('#project-task-list-cont ul').append('<li class="list-group-item" id="' + projectTaskList[i] + '"><img id="task-complete-icon" src="./assets/images/checked.svg" /><span class="task-text">' + data[1] + '</span><div class="task-options-cont"><div class="dot-set dropdown" id="dropdownMenu2" data-toggle="dropdown" aria-expanded="false"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><div id="task-options-menu" class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu2"><a class="complete-task-btn" state="false" class="dropdown-item" href="#"><span><i class="fa fa-check"></i></span>Task Complete</a><a class="delete-task-btn" class="dropdown-item" href="#"><span><i class="fa fa-trash-alt"></i></span>Delete Task</a></div></div></li>');
    if (data[0] === null || data[0] === undefined || data[0] === "false") {
      $('#' + projectTaskList[i]).children('img').fadeOut(300);
      $('#' + projectTaskList[i] + ' .task-text').css('opacity', '1');
      $('#' + projectTaskList[i] + ' div div ' + '.complete-task-btn').attr('state', 'false').html('<span><i class="fa fa-check"></i></span>Complete task');;
    } else {
      $('#' + projectTaskList[i]).children('img').fadeIn(300);
      $('#' + projectTaskList[i] + ' .task-text').css('opacity', '0.5');
      $('#' + projectTaskList[i] + ' div div ' + '.complete-task-btn').attr('state', 'true').html('<span><i class="fa fa-check"></i></span>Undone task');
    }
  }
  attachProjectTaskOptionBtnListener();
}

function openProjectNav() {
  $('#project-list-cont .project-item').remove();
  var data = loadProjects();
  var node = $('#project-pane-message-box');
  document.getElementById("side-nav").style.width = "250px";
  $('#menu-icon').fadeOut(300);
  menu_icon_state = 0;
  if (data === null || data === undefined) {
    $(node).text('Cannot fetch projects').fadeIn(300);
  } else {
    if (data.length < 1) {
      $(node).text('No projects found').fadeIn(300);
    } else {
      $(node).text('').fadeOut(0);
      for (var i = 0; i < data.length; i++) {
        var info = fs.readFileSync('./data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + data[i] + '/project_info.txt').toString().split(':');
        $('#project-list-cont').append('<a href="#" class="project-item" project-id="' + info[0] + '">' + info[1] + '</a>');
      }
      attachProjectLinkListener();
    }
  }
}

function loadProjects() {
  var filePath = './data-store/user-store/' + SESSION_STORE + '/project-store-dir/';
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
    return null;
  } else if (!fs.existsSync(filePath + '/project_list.txt')) {
    fs.writeFileSync(filePath + '/project_list.txt', "");
    return [];
  }

  var projectList = fs.readFileSync(filePath + '/project_list.txt').toString().split('\n');
  projectList.pop();

  return projectList;
}


/* Set the width of the side navigation to 0 */
function closeProjectNav() {
  document.getElementById("side-nav").style.width = "0";
  $('#menu-icon').fadeIn(300);
}

