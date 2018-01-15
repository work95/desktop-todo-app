var TASK_LIST = [];

/* To add the task in the list. */
function addTask(taskText, taskId) {
  for (var i = 0; i < TASK_LIST.length; i++) {
    if (taskText === TASK_LIST[i].split(":")[1]) {
      $('#task-input-error-box').text('Task already added!').slideDown(300);
      return;
    }
  }
  $('#task-list-cont ul').append('<li class="list-group-item" id="' + taskId + '"><img id="task-complete-icon" src="./assets/images/checked.svg" /><span>' + taskText + '</span><div class="task-options-cont"><div class="dot-set dropdown" id="dropdownMenu2" data-toggle="dropdown" aria-expanded="false"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><div id="task-options-menu" class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu2"><a class="complete-task-btn" state="false" class="dropdown-item" href="#"><span><i class="fa fa-check"></i></span>Complete Task</a><a class="delete-task-btn" class="dropdown-item" href="#"><span><i class="fa fa-trash-alt"></i></span>Delete Task</a></div></div></li>');
  attachTaskDeleteBtnListener();
  attachTaskCompleteBtnListener();

  var taskInfo = taskId + ":" + taskText;
  TASK_LIST.push(taskInfo);
  addTaskInStore(SESSION_STORE, taskInfo);
}

/* Attach click listener on the delete button of the task node. */
function attachTaskDeleteBtnListener() {
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

    // Attach again.
    $('.delete-task-btn').click(function () {
      // Remove error message if add task modal is open.
      $('#task-input-error-box').text("").slideUp(300).css('color', 'white');
      var nodeId = $(this).parent().parent().parent().attr('id');
      $('#' + nodeId).remove();
      deleteTaskFromStore(SESSION_STORE, nodeId);
    });
  });
}

function attachTaskCompleteBtnListener() {
  $(function () {
    $('.complete-task-btn').unbind('click');
    $('.complete-task-btn').click(function () {
      $('#task-input-error-box').text("").slideUp(300).css('color', 'white');
      var nodeId = $(this).parent().parent().parent().attr('id');
      if ($(this).attr('state') === "false") {
        $(this).attr('state', 'true');
        $(this).html('<span><i class="fa fa-check"></i></span>Undone task');
        $(this).parent().parent().parent().children('img').fadeIn(300);
        updateTaskCompleteInStore(SESSION_STORE, nodeId, true);
      } else {
        $(this).attr('state', 'false');
        $(this).html('<span><i class="fa fa-check"></i></span>Complete task');
        updateTaskCompleteInStore(SESSION_STORE, nodeId, false);
        $(this).parent().parent().parent().children('img').fadeOut(300);
      }
    });
  });
}

/* Add the task in record. */
function addTaskInStore(userId, taskInfo) {
  var filePath = './data-store/user-store/' + userId + '/task-store-dir/';
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  var info = taskInfo.split(":");
  fs.appendFileSync(filePath + '/' + 'task-list.txt', info[0] + '\n');
  fs.writeFileSync(filePath + '/' + info[0] + '.txt', 'false\n\n' + info[1]);
}

function updateTaskCompleteInStore(userId, taskId, state) {
  var filePath = './data-store/user-store/' + userId + '/task-store-dir/';
  var taskInfo = fs.readFileSync(filePath + '/' + taskId + '.txt').toString().split("\n\n");
  fs.writeFileSync(filePath + '/' + taskId + '.txt', state + '\n\n' + taskInfo[1]);
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
      $('#task-input-error-box').text("").slideUp(300).css('color', 'white');
    }
  });
});

/* Delete the task from the record. */
function deleteTaskFromStore(userId, taskId) {
  var filePath = './data-store/user-store/' + userId + '/task-store-dir/task-list.txt';
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
    fs.unlinkSync('./data-store/user-store/' + userId + '/task-store-dir/' + taskId + '.txt');
  }
}

/* Load the task list. */
function loadTaskList(userId) {
  var filePath = './data-store/user-store/' + userId + '/task-store-dir/task-list.txt';
  if (!fs.existsSync(filePath)) {
    return {
      "status": false,
      "error": "NO_RECORD"
    };
  } else {
    TASK_LIST = fs.readFileSync(filePath).toString().split("\n");
    TASK_LIST.pop();
 
    for (var i = 0; i < TASK_LIST.length; i++) {
      var data = fs.readFileSync('./data-store/user-store/' + userId + '/task-store-dir/' + TASK_LIST[i] + '.txt').toString().split("\n\n");
      $('#task-list-cont ul').append('<li class="list-group-item" id="' + TASK_LIST[i] + '"><img id="task-complete-icon" src="./assets/images/checked.svg" /><span>' + data[1] + '</span><div class="task-options-cont"><div class="dot-set dropdown" id="dropdownMenu2" data-toggle="dropdown" aria-expanded="false"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><div id="task-options-menu" class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu2"><a class="complete-task-btn" state="false" class="dropdown-item" href="#"><span><i class="fa fa-check"></i></span>Task Complete</a><a class="delete-task-btn" class="dropdown-item" href="#"><span><i class="fa fa-trash-alt"></i></span>Delete Task</a></div></div></li>');
      if (data[0] === null || data[0] === undefined || data[0] === "false") {
        $('#' + TASK_LIST[i]).children('img').fadeOut(300);
        $('#' + TASK_LIST[i] + ' div div ' + '.complete-task-btn').attr('state', 'false').html('<span><i class="fa fa-check"></i></span>Complete task');;
      } else {
        $('#' + TASK_LIST[i]).children('img').fadeIn(300);
        $('#' + TASK_LIST[i] + ' div div ' + '.complete-task-btn').attr('state', 'true').html('<span><i class="fa fa-check"></i></span>Undone task');
      }
    }
    attachTaskDeleteBtnListener();
    attachTaskCompleteBtnListener();
  }
}
