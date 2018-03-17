/* Show quick access pane. */
$(function () {
  $('#quick-access-btn').click(function () {
    let screenSize = electron.screen.getPrimaryDisplay().size;
    currentWindow.setMinimumSize(250, 300);
    currentWindow.setSize(320, 450);
    currentWindow.setPosition(screenSize.width - 320, screenSize.height - 450, true);
    $('#quick-access-cont').slideDown(300);
    $('#task-list-cont ul').html('');
    $('#project-task-list-cont ul').html('');
    loadQuickProjectList();
  });
});

function loadQuickProjectList() {
  let projectList = loadProjects();
  let node = $('#quick-access-nav .dropdown-menu');
  node.html('');
  for (let i = 0; i < projectList.length; i++) {
    let info = fs.readFileSync('./data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + projectList[i] + '/project_info.txt').toString().split(':');
    node.append('<a class="dropdown-item quick-project-select" id="' + info[0] + '" href="#">' + info[1] + '</a>');
  }

  $(node).children('a.quick-project-select').unbind('click');
  $(node).children('a.quick-project-select').click(function () {
    let projectId = $(this).attr('id').trim();
    loadQuickProjectTasks(projectId);
    CURRENT_PROJECT_ID = projectId;
    LIST_CONT_STATE = 2;
  });
}

/* Hide the quick access pane. */
$(function () {
  $('#expand-back').click(function () {
    let screenSize = electron.screen.getPrimaryDisplay().size;
    currentWindow.setMinimumSize(500, 400);
    currentWindow.setSize(800, 600);
    currentWindow.center(true);
    $('#quick-access-cont').slideUp(300);
    $('#quick-display-list ul').html('');
    switch (LIST_CONT_STATE) {
      case 1:
      showMainTaskListCont();
      break;
      
      case 2:
      showProjectTaskListCont(CURRENT_PROJECT_ID);
      break;

      case 3:
      showNotesListCont();
      break;

      case 4:
      showNotificationsListCont();
      break;

    }
  });
});

$(function () {
  $('#quick-add-menu').click(function () {
    $('#quick-add-note, #quick-add-task').fadeOut(100);
    $('#quick-access-dropdown-list').fadeToggle(200);
  });
});

$(function () {
  $('#quick-add-task-link').click(function () {
    $('#quick-add-note').fadeOut(0);
    $('#quick-access-dropdown-list').fadeOut(0);
    $('#quick-add-task').fadeIn(200);
  });
});

$(function () {
  $('#quick-add-note-link').click(function () {
    $('#quick-add-task').fadeOut(0);
    $('#quick-access-dropdown-list').fadeOut(0);
    $('#quick-add-note').fadeIn(200);
  });
});

$(function () {
  $('#quick-add-task-tick').click(function () {
    let taskText = $('#quick-add-task-input').val().trim();
    if (taskText !== "" && taskText !== undefined && taskText !== null) {
      addTask(taskText, ("task_" + new Date().getTime().toString()));
      loadQuickTaskList();
    }
  });
});

$(function () {
  $('#quick-add-note-tick').click(function () {
     let noteText = $('#quick-add-note-input').val().trim();
     if (noteText !== "" && noteText !== undefined && noteText !== null) {
      addNote(noteText, ("note_" + new Date().getTime().toString()));
      loadQuickNoteList();
     }
  });
});

$(function () {
  $('#quick-access-nav-item-task').click(function () {
    loadQuickTaskList();
    LIST_CONT_STATE = 1;
  });
});

function loadQuickTaskList() {
  $('#quick-display-list ul').html('');

  let node = $('#quick-display-list ul');
  node.html('');
  let filePath = './data-store/user-store/' + SESSION_STORE + '/task-store-dir/task_list.txt';
  let taskList = fs.readFileSync(filePath).toString().split("\n");
  taskList.pop();
  if (!fs.existsSync(filePath)) {
    return;
  } else {
    let taskList = fs.readFileSync(filePath).toString().split("\n");
    taskList.pop();
    TASK_LIST = [];
 
    for (let i = 0; i < taskList.length; i++) {
      let data = decodeURIComponent(fs.readFileSync('./data-store/user-store/' + SESSION_STORE + '/task-store-dir/' + taskList[i] + '.txt').toString()).split("\n\n");
      let date = new Date(parseInt(taskList[i].substr(5)));
      TASK_LIST.push(taskList[i] + ":" + data[1] + ":" + encodeURIComponent(data[2]));
      $('#quick-display-list ul').append(getTaskTemplate(taskList[i], data[2], date));
      if (data[0] === null || data[0] === undefined || data[0] === "false") {
        $('#' + taskList[i] + ' #task-complete-icon').fadeOut(300);
        $('#' + taskList[i]).attr('status', 'false');
        $('#' + taskList[i] + ' .task-text').css('opacity', '1');
        $('#' + taskList[i] + ' div div ' + '.complete-task-btn').attr('state', 'false').html('<span><i class="fa fa-check"></i></span>Complete task');;
      } else {
        $('#' + taskList[i] + ' #task-complete-icon').fadeIn(300);
        $('#' + taskList[i]).attr('status', 'true');
        $('#' + taskList[i] + ' .task-text').css('opacity', '0.5');
        $('#' + taskList[i] + ' div div ' + '.complete-task-btn').attr('state', 'true').html('<span><i class="fa fa-check"></i></span>Undone task');
      }
    }
    attachTaskOptionBtnListener();
  }
}

function loadQuickProjectTasks(projectId) {
  $('#quick-display-list ul').html('');
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
    let date = new Date(parseInt(projectTaskList[i].substr(5)));
    PROJECT_TASK_LIST.push(projectTaskList[i] + ":" + data[1] + ":" + encodeURIComponent(data[2]));
    $('#quick-display-list ul').append(getTaskTemplate(projectTaskList[i], data[2], date));
    if (data[0] === null || data[0] === undefined || data[0] === "false") {
      $('#' + projectTaskList[i] + ' #task-complete-icon').fadeOut(300);
      $('#' + projectTaskList[i]).attr('status', 'false');
      $('#' + projectTaskList[i] + ' .task-text').css('opacity', '1');
      $('#' + projectTaskList[i] + ' div div ' + '.complete-task-btn').attr('state', 'false').html('<span><i class="fa fa-check"></i></span>Complete task');;
    } else {
      $('#' + projectTaskList[i] + ' #task-complete-icon').fadeIn(300);
      $('#' + projectTaskList[i]).attr('status', 'true');
      $('#' + projectTaskList[i] + ' .task-text').css('opacity', '0.5');
      $('#' + projectTaskList[i] + ' div div ' + '.complete-task-btn').attr('state', 'true').html('<span><i class="fa fa-check"></i></span>Undone task');
    }
  }
  attachTaskOptionBtnListener();  
}

function loadQuickNoteList() {
  $('#quick-display-list ul').html('');
  let filePath = './data-store/user-store/' + SESSION_STORE + '/note-store-dir/note_list.txt';
  if (!fs.existsSync(filePath)) {
    return;
  } else {
    let notesList = fs.readFileSync(filePath).toString().split("\n");
    notesList.pop();
    NOTES_LIST = [];
 
    for (let i = 0; i < notesList.length; i++) {
      let data = decodeURIComponent(fs.readFileSync('./data-store/user-store/' + SESSION_STORE + '/note-store-dir/' + notesList[i] + '.txt').toString());
      let date = new Date(parseInt(notesList[i].substr(5)));
      NOTES_LIST.push(notesList[i] + ":" + encodeURIComponent(data));
      $('#quick-display-list ul').append(getNoteTemplate(notesList[i], data, date));
    }
  }
  attachNoteOptionBtnListener();
}

$(function () {
  $('#quick-access-nav-item-note').click(function () {
    loadQuickNoteList();
    LIST_CONT_STATE = 3;
  });
});

function loadQuickNotificationList() {
  $('#quick-display-list ul').html('');

  for (let i = 0; i < SHOWN_NOTIFICATIONS.length; i++) {
    let info = getTaskInfo(SHOWN_NOTIFICATIONS[i]);
    let taskInfo = {};

    if (info['type'] === "project") {
      taskInfo['type'] = "pt";
      taskInfo['projectId'] = info['projectId'];
      taskInfo['projectName'] = info['projectName'];
      taskInfo['heading'] = info['projectName'];

    } else if (info['type'] === "simple") {
      taskInfo['type'] = "t";
      taskInfo['heading'] = "Simple Task";
    }

    let date = new Date(parseInt(info['taskId'].split("_")[1]));
    taskInfo['taskDate'] = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + "";
    taskInfo['timeLeft'] = getTimeLeftString(info['taskTimeLeft']);
    taskInfo['taskText'] = info['taskText'];
    $('#quick-display-list ul').append(getNotificationTemplate(taskInfo));
  }
}

$(function () {
  $('#quick-access-nav-item-notification').click(function () {
    loadQuickNotificationList();
    LIST_CONT_STATE = 4;
  });
});
