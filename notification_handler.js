const countdown = require("countdown");
const electron = require('electron');
const {ipcRenderer} = require('electron');
const Config = require("./Config");
const UiIndex = require("./ui_index");
const Utility = require("./Utility");

module.exports = {
  checkNotifications: function () {
    let list = Config.TASK_LIST.toKeyArray();
    let endTimeList = {};
    let showFlag = 0;
    for (let i = 0; i < list.length; i++) {
      if (Config.SHOWN_NOTIFICATIONS.indexOf(list[i]) < 0) {
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
  if (Config.SHOWN_NOTIFICATIONS.indexOf(taskId) < 0) {
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

let lofo;
function showNotifications(endTimeList) {
  let taskInfo = {};
  for (let i = 0; i < endTimeList.length; i++) {
    if (!isTaskNotified(endTimeList[i])) {
      let info = Config.TASK_LIST.get(endTimeList[i]);
      let timeSpan = getTimeLeftObject(info["taskEndTime"]);
      if (timeSpan.hours <= 1 && timeSpan.value > 0) {
        let date = new Date(parseInt(info["taskStartTime"]));
        taskInfo["taskId"] = info["taskId"];
        taskInfo["taskDate"] = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        taskInfo["timeLeft"] = getTimeLeftString(info["taskEndTime"]);
        taskInfo["taskText"] = decodeURIComponent(info["taskText"]);
        showNotification(taskInfo);
        return;
      }
    }
  }
}

function showNotification(taskInfo) {
  if (Config.NOTIFICATION_COUNT > 0) {
    $('#notification-count-badge').fadeIn(200).text(Config.NOTIFICATION_COUNT);
  }

  $('#notification-pane ul').append(getNotificationTemplate(taskInfo));
  Config.SHOWN_NOTIFICATIONS.push(taskInfo["taskId"]);

  let screenSize = electron.screen.getPrimaryDisplay().size;
  ipcRenderer.send('notification-open',
    screenSize.width - 320,
    50,
    taskInfo['timeLeft'],
    (decodeURIComponent(taskInfo["taskText"]))
  );
}

/* Template for notification element. */
function getNotificationTemplate(taskInfo) {
  let node = '' +
    '<a href="#" id="notif_' + taskInfo["taskId"] + '" class="list-group-item list-group-item-action flex-column align-items-start">' +
    '<div class="d-flex w-100 justify-content-between">' +
    '<h5 class="mb-1">' + taskInfo["taskText"] + '</h5>' +
    '<small class="text-muted">' + taskInfo["taskDate"] + '</small>' +
    '</div>' +
    '<small class="text-muted">' + taskInfo["timeLeft"] + '</small>' +
    '</a>';

  return node;
}
