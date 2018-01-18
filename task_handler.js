/* To add the task in the list. */
function addTask(taskText, taskId) {
  for (var i = 0; i < TASK_LIST.length; i++) {
    if (taskText.toLowerCase() === TASK_LIST[i].split(":")[1].toLowerCase()) {
      $('#task-input-error-box').text('Task already added!').slideDown(300);
      return;
    }
  }
  $('#task-list-cont ul').append('<li class="list-group-item" id="' + taskId + '"><img id="task-complete-icon" src="./assets/images/checked.svg" /><span class="task-text">' + taskText + '</span><div class="task-options-cont"><div class="dot-set dropdown" id="dropdownMenu2" data-toggle="dropdown" aria-expanded="false"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><div id="task-options-menu" class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu2"><a class="complete-task-btn" state="false" class="dropdown-item" href="#"><span><i class="fa fa-check"></i></span>Complete Task</a><a class="delete-task-btn" class="dropdown-item" href="#"><span><i class="fa fa-trash-alt"></i></span>Delete Task</a></div></div></li>');
  attachTaskOptionBtnListener();

  var taskInfo = taskId + ":" + taskText;
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
  fs.writeFileSync(filePath + '/' + info[0] + '.txt', 'false\n\n' + info[1]);
}

function updateTaskCompleteInStore(userId, taskId, state) {
  var filePath = './data-store/user-store/' + userId + '/task-store-dir/';
  var taskInfo = fs.readFileSync(filePath + '/' + taskId + '.txt').toString().split("\n\n");
  fs.writeFileSync(filePath + '/' + taskId + '.txt', state + '\n\n' + taskInfo[1]);
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
  var filePath = './data-store/user-store/' + userId + '/task-store-dir/task_list.txt';
  if (!fs.existsSync(filePath)) {
    return;
  } else {
    var taskList = fs.readFileSync(filePath).toString().split("\n");
    taskList.pop();
 
    for (var i = 0; i < taskList.length; i++) {
      var data = fs.readFileSync('./data-store/user-store/' + userId + '/task-store-dir/' + taskList[i] + '.txt').toString().split("\n\n");
      TASK_LIST.push(taskList[i] + ":" + data[1]);
      $('#task-list-cont ul').append('<li class="list-group-item" id="' + taskList[i] + '"><img id="task-complete-icon" src="./assets/images/checked.svg" /><span class="task-text">' + data[1] + '</span><div class="task-options-cont"><div class="dot-set dropdown" id="dropdownMenu2" data-toggle="dropdown" aria-expanded="false"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><div id="task-options-menu" class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu2"><a class="complete-task-btn" state="false" class="dropdown-item" href="#"><span><i class="fa fa-check"></i></span>Task Complete</a><a class="delete-task-btn" class="dropdown-item" href="#"><span><i class="fa fa-trash-alt"></i></span>Delete Task</a></div></div></li>');
      if (data[0] === null || data[0] === undefined || data[0] === "false") {
        $('#' + taskList[i]).children('img').fadeOut(300);
        $('#' + taskList[i] + ' .task-text').css('opacity', '1');
        $('#' + taskList[i] + ' div div ' + '.complete-task-btn').attr('state', 'false').html('<span><i class="fa fa-check"></i></span>Complete task');;
      } else {
        $('#' + taskList[i]).children('img').fadeIn(300);
        $('#' + taskList[i] + ' .task-text').css('opacity', '0.5');
        $('#' + taskList[i] + ' div div ' + '.complete-task-btn').attr('state', 'true').html('<span><i class="fa fa-check"></i></span>Undone task');
      }
    }
    attachTaskOptionBtnListener();
  }
}

/* Show the task input box when plus button on the header is clicked. */
$(function () {
  $('#add-task-btn').click(function () {
    $('#task-add-input-box').slideDown(250);
    $('#task-text-input').focus();
  });
});

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

function attachTaskOptionBtnListener() {
  $(function () {
    /* Unbind the previous ones. */
    $('.delete-task-btn').unbind('click');
    $('.complete-task-btn').unbind('click');

    /* Attach new ones. */
    $('.delete-task-btn').click(function () {
      // Remove error message if add task modal is open.
      $('#task-input-error-box').text("").slideUp(300).css('color', 'black');
      var nodeId = $(this).parent().parent().parent().attr('id');
      $('#' + nodeId).remove();
      deleteTaskFromStore(SESSION_STORE, nodeId);
    });

    $('.complete-task-btn').click(function () {
      $('#task-input-error-box').text("").slideUp(300).css('color', 'black');
      var nodeId = $(this).parent().parent().parent().attr('id');
      if ($(this).attr('state') === "false") {
        $(this).attr('state', 'true');
        $('#' + nodeId + ' .task-text').css('opacity', '0.5');
        $(this).html('<span><i class="fa fa-check"></i></span>Undone task');
        $(this).parent().parent().parent().children('img').fadeIn(300);
        updateTaskCompleteInStore(SESSION_STORE, nodeId, true);
      } else {
        $(this).attr('state', 'false');
        $('#' + nodeId + ' .task-text').css('opacity', '1');
        $(this).html('<span><i class="fa fa-check"></i></span>Complete task');
        updateTaskCompleteInStore(SESSION_STORE, nodeId, false);
        $(this).parent().parent().parent().children('img').fadeOut(300);
      }
    });
  });
}
