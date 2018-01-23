/* To add the task in the list. */
function addTask(taskText, taskId) {
  for (var i = 0; i < TASK_LIST.length; i++) {
    if (encodeURIComponent(taskText).toLowerCase() === TASK_LIST[i].split(":")[2].toLowerCase()) {
      $('#task-input-error-box').text('Task already added!').slideDown(300);
      return;
    }
  }

  var date = new Date(parseInt(taskId.substr(5)));
  $('#task-list-cont ul').append(getTaskTemplate(taskId, taskText, date));
  attachTaskOptionBtnListener();

  var taskInfo = taskId + ":0:" + encodeURIComponent(taskText);
  TASK_LIST.push(taskInfo);
  addTaskInStore(SESSION_STORE, taskInfo);
}

/* Add the task in record. */
function addTaskInStore(userId, taskInfo) {
  var filePath = './data-store/user-store/' + userId + '/task-store-dir/';
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  var info = taskInfo.split(":");
  fs.appendFileSync(filePath + '/' + 'task_list.txt', info[0] + '\n');
  fs.writeFileSync(filePath + '/' + info[0] + '.txt', 'false\n\n' + '0\n\n' + info[2]);
}

function updateTaskCompleteInStore(userId, taskId, state) {
  var filePath = './data-store/user-store/' + userId + '/task-store-dir/';
  var taskInfo = fs.readFileSync(filePath + '/' + taskId + '.txt').toString().split("\n\n");
  fs.writeFileSync(filePath + '/' + taskId + '.txt', state + '\n\n' + taskInfo[1] + '\n\n' + taskInfo[2]);
}

/* Delete the task from the record. */
function deleteTaskFromStore(userId, taskId) {
  var filePathA = './data-store/user-store/' + userId + '/task-store-dir';
  var filePathB = filePathA + '/task_list.txt';

  if (!fs.existsSync(filePathB)) {
    return;
  } else {
    var finalList = "";
    var list = fs.readFileSync(filePathB).toString().split("\n");
    list.pop();

    for (var i = 0; i < list.length; i++) {
      if (list[i].split(":")[0] === taskId) {
        list.splice(i, 1);
      } else {
        finalList += list[i] + '\n';
      }
    }

    fs.writeFileSync(filePathB, finalList);
    fs.unlinkSync(filePathA + '/' + taskId + '.txt');

    for (var i = 0; i < TASK_LIST.length; i++) {
      if (TASK_LIST[i].split(":")[0] === taskId) {
        TASK_LIST.splice(i, 1);
        break;
      }
    }
  }
}

/* Load the task list. */
function loadTaskList(userId) {
  $('#task-list-cont ul').html('');
  var filePath = './data-store/user-store/' + userId + '/task-store-dir/task_list.txt';
  if (!fs.existsSync(filePath)) {
    return;
  } else {
    var taskList = fs.readFileSync(filePath).toString().split("\n");
    taskList.pop();
    TASK_LIST = [];
 
    for (var i = 0; i < taskList.length; i++) {
      var data = decodeURIComponent(fs.readFileSync('./data-store/user-store/' + userId + '/task-store-dir/' + taskList[i] + '.txt').toString()).split("\n\n");
      TASK_LIST.push(taskList[i] + ":" + data[1] + ":" + encodeURIComponent(data[2]));
      var date = new Date(parseInt(taskList[i].substr(5)));
      $('#task-list-cont ul').append(getTaskTemplate(taskList[i], data[2], date));
      if (data[0] === null || data[0] === undefined || data[0] === "false") {
        $('#' + taskList[i]).children('img').fadeOut(300);
        $('#' + taskList[i]).attr('status', 'false');
        $('#' + taskList[i] + ' .task-text').css('opacity', '1');
        $('#' + taskList[i] + ' div div ' + '.complete-task-btn').attr('state', 'false').html('<span><i class="fa fa-check"></i></span>Complete task');;
      } else {
        $('#' + taskList[i]).children('img').fadeIn(300);
        $('#' + taskList[i]).attr('status', 'true');
        $('#' + taskList[i] + ' .task-text').css('opacity', '0.5');
        $('#' + taskList[i] + ' div div ' + '.complete-task-btn').attr('state', 'true').html('<span><i class="fa fa-check"></i></span>Undone task');
      }
    }
    attachTaskOptionBtnListener();
  }
}

function addMainTaskTimeLimit(taskId, endTime) {
  var filePath = './data-store/user-store/' + SESSION_STORE + '/task-store-dir/';
  var taskInfo = fs.readFileSync(filePath + '/' + taskId + '.txt').toString().split("\n\n");
  fs.writeFileSync(filePath + '/' + taskId + '.txt', taskInfo[0] + '\n\n' + endTime + '\n\n' + taskInfo[2]);
  for (var i = 0; i < TASK_LIST.length; i++) {
    if (TASK_LIST[i].split(":")[0] === taskId) {
      var info = TASK_LIST[i].split(":");
      TASK_LIST[i] = info[0] + ":" + endTime + ":" + info[2];
    }
  }
}

/* To hide the error message below the input form when a key is pressed again. */
$(function () {
  $('#task-text-input').on('keydown', function (e) {
    if (e.keyCode === KeyCodes.ENTER) {

      // If control + enter is pressed more than once then show the error in red color.
      if ($('#task-input-error-box').text().length > 1) {
        $('#task-input-error-box').css('color', 'red');
      }
    } else if (e.keyCode === KeyCodes.CONTROL) {
      return;
    } else {
      $('#task-input-error-box').text("").slideUp(300).css('color', 'black');
    }
  });
});

