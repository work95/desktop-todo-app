const countdown = require("countdown");
const electron = require('electron');
const {ipcRenderer} = require('electron');
const Config = require("./Config");
const Utility = require("./Utility");

module.exports = {
  checkNotifications: function () {
    let list = Config.Tasks.getKeys()
    let endTimeList = {};
    let showFlag = 0;
    for (let i = 0; i < list.length; i++) {
      if (Config.SHOWN_NOTIFICATIONS.indexOf(list[i]) < 0) {
        showFlag++;
        let time = Config.Tasks.getTask(list[i])["endTime"];
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

function showNotifications(endTimeList) {
  let taskInfo = {};
  for (let i = 0; i < endTimeList.length; i++) {
    if (!isTaskNotified(endTimeList[i])) {
      let info = Config.Tasks.getTask(endTimeList[i]);
      let timeSpan = getTimeLeftObject(info["endTime"]);
      if (timeSpan.hours <= 1 && timeSpan.value > 0) {
        let date = new Date(parseInt(info["startTime"]));
        taskInfo["id"] = info["id"];
        taskInfo["date"] = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        taskInfo["left"] = getTimeLeftString(info["endTime"]);
        taskInfo["text"] = decodeURIComponent(info["text"]);
        showNotification(taskInfo);
        return;
      }
    }
  }
}

function showNotification(taskInfo) {
  Config.SHOWN_NOTIFICATIONS.push(taskInfo["id"]);

  let screenSize = electron.screen.getPrimaryDisplay().size;
  ipcRenderer.send('notification-open',
    screenSize.width - 320,
    50,
    taskInfo['left'],
    (decodeURIComponent(taskInfo["text"]))
  );
}
