var TASK_LIST = [];

/* To add the task in the list. */
function addTask(taskText, taskId) {
  for (var i = 0; i < TASK_LIST.length; i++) {
    if (taskText === TASK_LIST[i].split(":")[1]) {
      $('#task-input-error-box').text('Task already added!').slideDown(300);
      return;
    }
  }
  $('#task-list-cont ul').append('<li class="list-group-item" id="' + taskId + '">' + taskText + '<span class="delete-task-btn"><i class="fa fa-trash-alt"></i></span></li>');
  attachTaskDeleteBtnListener();

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
      var nodeId = $(this).parent().attr('id');
      $('#' + nodeId).remove();
      deleteTaskFromStore(SESSION_STORE, nodeId);
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
  fs.writeFileSync(filePath + '/' + info[0] + '.txt', info[1]);
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

    $('#task-list-cont ul').html('<li style="display: none;" id="task_0" class="list-group-item"><span class="delete-task-btn"><i class="fa fa-trash-alt"></i></span><!-- <input type="checkbox" taskid="task_0" class="select-task" /> --></li>');
    for (var i = 0; i < TASK_LIST.length; i++) {
      var data = fs.readFileSync('./data-store/user-store/' + userId + '/task-store-dir/' + TASK_LIST[i] + '.txt');
      $('#task-list-cont ul').append('<li class="list-group-item" id="' + TASK_LIST[i] + '">' + data + '<span class="delete-task-btn"><i class="fa fa-trash-alt"></i></span></li>');
    }
    attachTaskDeleteBtnListener();
  }
}
