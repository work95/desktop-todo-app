function addProject(projectName, projectId) {
  for (let i = 0; i < PROJECT_LIST.length; i++) {
    if (projectName.toLowerCase() === PROJECT_LIST[i].split(":")[1].toLowerCase()) {
      $('#project-input-error-box').text('Project already added!').slideDown(300);
      return;
    }
  }

  $('#project-list-cont').append('<a href="#" class="project-item" project-id="' + projectId + '">' + projectName + '</a>')
  let projectInfo = projectId + ":" + projectName;
  PROJECT_LIST.push(projectInfo);
  addProjectInStore(SESSION_STORE, projectInfo);
  attachProjectLinkListener();

  CURRENT_PROJECT_ID = projectId;
  showProjectTaskListCont(projectName);
}

function addProjectTask(taskText, taskId) {
  for (let i = 0; i < PROJECT_TASK_LIST.length; i++) {
    if (encodeURIComponent(taskText).toLowerCase() === PROJECT_TASK_LIST[i].split(":")[2].toLowerCase()) {
      $('#task-input-error-box').text('Task already added!').slideDown(300);
      return;
    }
  }

  let date = new Date(parseInt(taskId.substr(5)));
  $('#project-task-list-cont ul').append(getTaskTemplate(taskId, taskText, date));
  attachTaskOptionBtnListener();

  let taskInfo = taskId + ":0:" + encodeURIComponent(taskText);
  PROJECT_TASK_LIST.push(taskInfo);
  addProjectTaskInStore(SESSION_STORE, taskInfo);
}

function addProjectTaskInStore(userId, taskInfo) {
  let filePath = './data-store/user-store/' + userId + '/project-store-dir/';
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  let info = taskInfo.split(":");
  fs.appendFileSync(filePath + '/' + CURRENT_PROJECT_ID + '/project_task_list.txt', info[0] + '\n');
  fs.writeFileSync(filePath + '/' + CURRENT_PROJECT_ID + '/' + info[0] + '.txt', 'false\n\n' + '0\n\n' + info[2]);
  porting.portProfile(SESSION_STORE, null);
}

function addProjectInStore(userId, projectInfo) {
  let filePath = './data-store/user-store/' + userId + '/project-store-dir/';
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  let info = projectInfo.split(":");
  fs.appendFileSync(filePath + '/' + 'project_list.txt', info[0] + '\n');
  fs.mkdirSync(filePath + '/' + info[0]);
  fs.writeFileSync(filePath + '/' + info[0] + '/project_info.txt', projectInfo);
  porting.portProfile(SESSION_STORE, null);
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
      let projectId = $(this).attr('project-id').toString();
      let projectInfo = fs.readFileSync('./data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + projectId + '/project_info.txt').toString().split(":");
      $('#delete-project-btn').fadeIn(300);
      loadProjectTasks(projectId);
      CURRENT_PROJECT_ID = projectId;
      closeProjectNav();
      $('#project-tag-display').text(projectInfo[1]).fadeIn(100);
    });
  });
}

function updateProjectTaskCompleteInStore(userId, taskId, state) {
  let filePath = './data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + CURRENT_PROJECT_ID + '/' + taskId + '.txt';
  let taskInfo = fs.readFileSync(filePath).toString().split("\n\n");
  fs.writeFileSync(filePath, state + '\n\n' + taskInfo[1] + '\n\n' + taskInfo[2]);
  porting.portProfile(SESSION_STORE, null);
}

function deleteProjectTaskFromStore(userId, taskId) {
  let filePath = './data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + CURRENT_PROJECT_ID + '/project_task_list.txt';
  if (!fs.existsSync(filePath)) {
    return null;
  } else {
    let list = fs.readFileSync(filePath).toString().split("\n");
    list.pop();
    let finalList = "";

    for (let i = 0; i < list.length; i++) {
      if (list[i].split(":")[0] === taskId) {
        list.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i < list.length; i++) {
      finalList += list[i] + '\n';
    }

    fs.writeFileSync(filePath, finalList);
    fs.unlinkSync('./data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + CURRENT_PROJECT_ID + '/' + taskId + '.txt');

    for (let i = 0; i < PROJECT_TASK_LIST.length; i++) {
      if (PROJECT_TASK_LIST[i].split(":")[0] === taskId) {
        PROJECT_TASK_LIST.splice(i, 1);
        break;
      }
    }
  }

  porting.portProfile(SESSION_STORE, null);
}

function loadProjectTasks(projectId) {
  $('#project-task-list-cont ul').html('');
  let filePath = './data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + projectId + '/project_task_list.txt';
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
    return null;
  }
  let projectTaskList = fs.readFileSync(filePath).toString().split("\n");
  projectTaskList.pop();
  PROJECT_TASK_LIST = [];

  for (let i = 0; i < projectTaskList.length; i++) {
    let data = decodeURIComponent(fs.readFileSync('./data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + projectId + '/' + projectTaskList[i] + '.txt').toString()).split('\n\n');
    PROJECT_TASK_LIST.push(projectTaskList[i] + ":" + data[1] + ":" + encodeURIComponent(data[2]));
    let date = new Date(parseInt(projectTaskList[i].substr(5)));
    $('#project-task-list-cont ul').append(getTaskTemplate(projectTaskList[i], data[2], date));
    if (data[0] === null || data[0] === undefined || data[0] === "false") {
      $('#' + projectTaskList[i]).children('img').fadeOut(300);
      $('#' + projectTaskList[i]).attr('status', 'false');
      $('#' + projectTaskList[i] + ' .task-text').css('opacity', '1');
      $('#' + projectTaskList[i] + ' div div ' + '.complete-task-btn').attr('state', 'false').html('<span><i class="fa fa-check"></i></span>Complete task');;
    } else {
      $('#' + projectTaskList[i]).children('img').fadeIn(300);
      $('#' + projectTaskList[i]).attr('status', 'true');
      $('#' + projectTaskList[i] + ' .task-text').css('opacity', '0.5');
      $('#' + projectTaskList[i] + ' div div ' + '.complete-task-btn').attr('state', 'true').html('<span><i class="fa fa-check"></i></span>Undone task');
    }
  }
  attachTaskOptionBtnListener();  
}

function addProjectTaskTimeLimit(taskId, endTime) {
  let filePath = './data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + CURRENT_PROJECT_ID + '/' + taskId + '.txt';
  let taskInfo = fs.readFileSync(filePath).toString().split("\n\n");
  fs.writeFileSync(filePath, taskInfo[0] + '\n\n' + endTime + '\n\n' + taskInfo[2]);
  for (let i = 0; i < PROJECT_TASK_LIST.length; i++) {
    if (PROJECT_TASK_LIST[i].split(":")[0] === taskId) {
      let info = PROJECT_TASK_LIST[i].split(":");
      PROJECT_TASK_LIST[i] = info[0] + ":" + endTime + ":" + info[2];
    }
  }
  porting.portProfile(SESSION_STORE, null);
}

function openProjectNav() {
  $('#project-list-cont .project-item').remove();
  let data = loadProjects();
  let node = $('#project-pane-message-box');
  document.getElementById("side-nav").style.width = "250px";
  $('#menu-icon').fadeOut(300);
  menu_icon_state = 0;
  if (data === null || data === undefined) {
    $(node).fadeIn(0);
    $(node).children('span').text('Cannot fetch projects');
    $('#project-pane-message-btn').fadeOut(0);
  } else {
    if (data.length < 1) {
      $(node).fadeIn(300);
      $(node).children('span').text('No projects found');
      $('#project-pane-message-btn').text('Add project').fadeIn(300);
    } else {
      $(node).fadeOut(0);
      $(node).children('span').text('');
      $('#project-pane-message-btn').fadeOut(0);
      for (let i = 0; i < data.length; i++) {
        let info = fs.readFileSync('./data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + data[i] + '/project_info.txt').toString().split(':');
        $('#project-list-cont').append('<a href="#" class="project-item" project-id="' + info[0] + '">' + info[1] + '</a>');
      }
      attachProjectLinkListener();
    }
  }
}

function closeProjectNav() {
  document.getElementById("side-nav").style.width = "0";
  if (CURRENT_PROJECT_ID === "" || CURRENT_PROJECT_ID === undefined || CURRENT_PROJECT_ID === null) {
    showMainTaskListCont();
    $('#menu-icon').fadeOut(300);
  } else {
    $('#menu-icon').fadeIn(300);
  }
}

$(function () {
  $('#project-pane-message-box button').click(function () {
    closeProjectNav();
    OPEN_DROPDOWN_BOX = 2;
    $('#project-add-input-box').slideDown(250);
    $('#project-text-input').focus();
  });
});

function loadProjects() {
  let filePath = './data-store/user-store/' + SESSION_STORE + '/project-store-dir/';
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
    fs.writeFileSync(filePath + '/project_list.txt', "");
    return [];
  } else if (!fs.existsSync(filePath + '/project_list.txt')) {
    fs.writeFileSync(filePath + '/project_list.txt', "");
    return [];
  }

  let projectList = fs.readFileSync(filePath + '/project_list.txt').toString().split('\n');
  projectList.pop();

  return projectList;
}

$(function () {
  $('#delete-project-btn').click(function () {
    deleteProjectFromStore(CURRENT_PROJECT_ID);
    $(this).fadeOut(300);
    openProjectNav();
    $('#project-task-list-cont ul').html("");
    $('#project-tag-display').text("").fadeOut(300);
    $('#menu-icon').fadeOut(100);
  });
});

function deleteProjectFromStore(projectId) {
  let filePath = './data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + projectId;
  let objectList = fs.readdirSync(filePath);
  for (let i = 0; i < objectList.length; i++) {
    fs.unlinkSync(filePath + '/' + objectList[i]);
  }
  fs.rmdirSync(filePath);

  let finalList = "";
  let projectList = fs.readFileSync('./data-store/user-store/' + SESSION_STORE + '/project-store-dir/project_list.txt').toString().split('\n');
  projectList.pop();

  for (let i = 0; i < projectList.length; i++) {
    if (projectList[i] === projectId) {
      projectList.splice(i, 1);
      break;
    }
  }

  for (let i = 0; i < projectList.length; i++) {
    finalList += projectList[i] + '\n';    
  }
  
  fs.writeFileSync('./data-store/user-store/' + SESSION_STORE + '/project-store-dir/project_list.txt', finalList);

  // Remove project from the loaded list.
  for (let i = 0; i < PROJECT_LIST.length; i++) {
    if (PROJECT_LIST[i].split(":")[0] === projectId) {
      PROJECT_LIST.splice(i, 1);
      break;
    }
  }

  CURRENT_PROJECT_ID = "";
  porting.portProfile(SESSION_STORE, null);
}

function showProjectTaskListCont(projectName) {
  $('#project-add-input-box').slideUp(250).children('input').val("");
  $('#project-input-error-box').html("");
  $('#delete-project-btn').fadeIn(300);
  $('#project-tag-display').text(projectName).fadeIn(300);
  $('#switch-list-cont').css('opacity', 0.5);
  $('#task-list-cont').slideUp(300);
  $('#project-task-list-cont').fadeIn(300);
  $('#project-task-list-cont ul').html('');
  $('#menu-icon').fadeIn(100);
  LIST_CONT_STATE = 2;
}
