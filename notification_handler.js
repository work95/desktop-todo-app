const countdown = require("countdown");
const electron = require('electron');
const {ipcRenderer} = require('electron');
const Config = require("./Config");
const Utility = require("./Utility");

var SHOWN_NOTIFICATIONS = [];
var NOTIFICATION_COUNT = 0;

module.exports = {
  NOTIFICATION_COUNT,

  checkNotifications: function () {
    let list = Config.TASK_LIST.toKeyArray();
    let endTimeList = {};
    let showFlag = 0;
    for (let i = 0; i < list.length; i++) {
      if (SHOWN_NOTIFICATIONS.indexOf(list[i]) < 0) {
        showFlag++;
        let time = Config.TASK_LIST.get(list[i])["taskEndTime"];
        if (time != null) {
          endTimeList[list[i]] = {
            endTime: time
          };
        }
      }
    }

    if (showFlag > 0) { showNotifications(Utility.jsonSorter(endTimeList)); }
  }
}

function isTaskNotified(taskId) {
  if (SHOWN_NOTIFICATIONS.indexOf(taskId) < 0) {
    return false;
  }
  return true;
}

function getTimeLeftString(taskTimeLeft) {   
  let dateStart = new Date();
  let dateEnd = new Date(parseInt(taskTimeLeft));
  let timeString = (dateStart < dateEnd) ? (getTimeLeftObject(taskTimeLeft).toString()) : "Time over";
  return timeString;
}

function getTimeLeftObject(taskTimeLeft) {
  let units = countdown.DAYS | countdown.HOURS | countdown.MINUTES;
  return countdown(new Date(), new Date(parseInt(taskTimeLeft)), units);
}

function showNotifications(endTimeList) {
  let taskInfo = {};
  for (let i = 0; i < endTimeList.length; i++) {
    if (!isTaskNotified(endTimeList[i])) {
      let info = Config.TASK_LIST.get(endTimeList[i]);
      if (getTimeLeftObject(info["taskEndTime"]).hours <= 1) {
        let date = new Date(parseInt(info["taskStartTime"]));
        taskInfo["taskId"] = info["taskId"];
        taskInfo["taskDate"] = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        taskInfo["timeLeft"] = getTimeLeftString(info["taskEndTime"]);
        taskInfo["taskText"] = info["taskText"];
        showNotification(taskInfo);
        return;
      }
    }
  }
}

function showNotification(taskInfo) {
  if (++NOTIFICATION_COUNT > 0) {
    $('#notification-count-badge').fadeIn(200).text(NOTIFICATION_COUNT);
  }

  $('#notification-pane ul').append(getNotificationTemplate(taskInfo));
  SHOWN_NOTIFICATIONS.push(taskInfo["taskId"]);

  let taskTextTemp = decodeURIComponent(taskInfo['taskText']);

  if (taskTextTemp.length > 50) {
    taskTextTemp = taskTextTemp.substr(0, 50) + "...";
  }

  let screenSize = electron.screen.getPrimaryDisplay().size;
  ipcRenderer.send('notification-open',
    screenSize.width - 320,
    50,
    taskInfo['timeLeft'],
    (decodeURIComponent(taskInfo["taskText"]))
  );
}

function getNotificationTemplate(taskInfo) {
  let node = '' +
    '<a href="#" class="list-group-item list-group-item-action flex-column align-items-start">' +
    '<div class="d-flex w-100 justify-content-between">' +
    '<h5 class="mb-1">' + taskInfo["taskText"] + '</h5>' +
    '<small class="text-muted">' + taskInfo["taskDate"] + '</small>' +
    '</div>' +
    '<small class="text-muted">' + taskInfo["timeLeft"] + '</small>' +
    '</a>';

  return node;
}
