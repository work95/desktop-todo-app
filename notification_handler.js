const {ipcRenderer} = require('electron');

var NOTIF_TASK_LIST = [];
var NOTIF_PROJECT_TASK_LIST = [];

var SHOWN_NOTIFICATIONS = [];
var NOTIFICATION_COUNT = 0;

setInterval(function () {
  initializeNotificationSystem();
}, 60000);    // In every 1 minute.

function initializeNotificationSystem() {
  let filePath = './data-store/user-store/' + SESSION_STORE + '/project-store-dir/';
  if (!fs.existsSync(filePath)) {
    ;
  } else {
    let projectList = loadProjects();
    NOTIF_PROJECT_TASK_LIST = [];

    for (let j = 0; j < projectList.length; j++) {
      let projectTaskList = fs.readFileSync(filePath + '/' + projectList[j] + '/project_task_list.txt').toString().split("\n");
      projectTaskList.pop();

      for (let i = 0; i < projectTaskList.length; i++) {
        let data = decodeURIComponent(fs.readFileSync('./data-store/user-store/' + SESSION_STORE + '/project-store-dir/' + projectList[j] + '/' + projectTaskList[i] + '.txt').toString()).split('\n\n');
        NOTIF_PROJECT_TASK_LIST.push(projectTaskList[i] + ":" + data[1] + ":" + encodeURIComponent(data[2]));
      }
    }
  }

  filePath = './data-store/user-store/' + SESSION_STORE + '/task-store-dir/task_list.txt';
  if (!fs.existsSync(filePath)) {
    ;
  } else {
    NOTIF_TASK_LIST = [];
    let taskList = fs.readFileSync(filePath).toString().split("\n");
    taskList.pop();

    for (let i = 0; i < taskList.length; i++) {
      let data = decodeURIComponent(fs.readFileSync('./data-store/user-store/' + SESSION_STORE + '/task-store-dir/' + taskList[i] + '.txt').toString()).split("\n\n");
      NOTIF_TASK_LIST.push(taskList[i] + ":" + data[1] + ":" + encodeURIComponent(data[2]));
    }
  }

  checkNotification();
}

function checkNotification() {
  let taskTemp = [];

  for (let i = 0; i < NOTIF_PROJECT_TASK_LIST.length; i++) {
    let info = NOTIF_PROJECT_TASK_LIST[i].split(":");
    if (parseInt(info[1]) > 0) {
      if (!isTaskNotified(info[0])) {
        taskTemp.push(NOTIF_PROJECT_TASK_LIST[i]);        
      }

    }
  }

  for (let i = 0; i < NOTIF_TASK_LIST.length; i++) {
    let info = NOTIF_TASK_LIST[i].split(":");
    if (parseInt(info[1]) > 0) {
      if (!isTaskNotified(info[0])) {
        taskTemp.push(NOTIF_TASK_LIST[i]);
      }

    }
  }

  let timeSmallest = 9999999999999;
  let priority = taskTemp[0];

  for (let i = 0; i < taskTemp.length; i++) {
    let info = taskTemp[i].split(":");
    if (getTimeLeftString(parseInt(info[1])) !== "Time over") {
      if (parseInt(info[1]) < timeSmallest) {
        timeSmallest = info[1];
        priority = taskTemp[i];
      }
    }
  }

  // In case no task with time still left is there, don't send any notification.
  if (timeSmallest >= 9999999999999) {
    return;
  }

  // Show notification in the pane also.
  showNotificationInPane(priority);
}

function isTaskNotified(taskId) {
  for (let i = 0; i < SHOWN_NOTIFICATIONS.length; i++) {
    if (SHOWN_NOTIFICATIONS[i] === taskId) {
      return true;
    }
  }

  return false;
}

function getTimeLeftString(taskTimeLeft) {
  let units = countdown.DAYS | countdown.HOURS | countdown.MINUTES;
    
  let dateStart = new Date();
  let dateEnd = new Date(parseInt(taskTimeLeft));
  let timeString = dateStart < dateEnd ? (countdown(new Date(), new Date(parseInt(taskTimeLeft)), units).toString()) : "Time over";

  return timeString;
}

function showNotificationInPane(taskNotificationInfo) {
  let info = getTaskInfo(taskNotificationInfo.split(":")[0]);
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

  for (let i = 0; i < SHOWN_NOTIFICATIONS.length; i++) {
    if (SHOWN_NOTIFICATIONS[i] === info['taskId']) {
      return;
    }
  }

  NOTIFICATION_COUNT++;

  if (NOTIFICATION_COUNT > 0) {
    $('#notification-count-badge').fadeIn(200).text(NOTIFICATION_COUNT);
  }

  $('#notification-pane ul').append(getNotificationTemplate(taskInfo));
  SHOWN_NOTIFICATIONS.push(info['taskId']);

  let taskTextTemp = decodeURIComponent(taskInfo['taskText']);

  if (taskTextTemp.length > 50) {
    taskTextTemp = taskTextTemp.substr(0, 50) + "...";
  }

  let screenSize = electron.screen.getPrimaryDisplay().size;
  ipcRenderer.send('notification-open',
    screenSize.width - 320,
    50,
    taskInfo['timeLeft'] + " left",
    taskTextTemp
  );
}

$(function () {
  $('#notification-icon').click(function () {
    showNotificationPane();
  });
});

$(function () {
  $('#notification-pane-close-btn').click(function () {
    closeNotificationPane();
  });
});

function showNotificationPane() {
  NOTIFICATION_COUNT = 0;
  $('#notification-count-badge').fadeOut(200).text(NOTIFICATION_COUNT);
  $('#notification-pane').slideDown(200);
}

function closeNotificationPane() {
  $('#notification-pane').slideUp(200);

  // To not show empty list.
  if (LIST_CONT_STATE === 1 || LIST_CONT_STATE === 4) {
    showMainTaskListCont();
  }
}
