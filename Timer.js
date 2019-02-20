const countdown = require("countdown");
const Config = require("./Config");
const NotificationHandler = require("./notification_handler");

const UNITS = countdown.YEARS | countdown.MONTHS | countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS;


function Timer(taskId, node) {
  let taskObj = Config.Tasks.getTask(taskId);
  let endTime = new Date(parseInt(taskObj.endTime));

  let timeInterval = setInterval(function () {
    let t = countdown(new Date(), endTime, UNITS);
    if (
      (t.seconds === 0) && 
      ((t.hours === 1 && t.minutes === 0) || 
      (t.hours === 0 && t.minutes === 30) || 
      (t.hours === 0 && t.minutes === 5) || 
      (t.hours === 0 && t.minutes === 1) || 
      (t.hours === 0 && t.minutes === 0))
    ) {
      NotificationHandler.showNotification({
        "id": taskObj.id,
        "left": getTimeLeftString(endTime),
        "text": taskObj.text
      });
    }
    node.text(t.toString());
    if (new Date() > endTime) {
      node.text("Time over");
      clearInterval(timeInterval);
    }
  }, 1000);
  Config.Timers[taskId] = timeInterval;
}

function getTimeLeftString(taskTimeLeft) {
  return (
    (new Date() < taskTimeLeft) 
      ? (countdown(new Date(), taskTimeLeft, UNITS).toString()) 
      : "Time Over"
    );
}

module.exports = Timer;
