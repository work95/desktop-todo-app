var NOTES_LIST = [];
var NOTES_LIST_CONT_STATE = 0;

function addNote(noteText, noteId) {
  for (var i = 0; i < NOTES_LIST.length; i++) {
    if (encodeURIComponent(noteText).toLowerCase() === NOTES_LIST[i].split(":")[1].toLowerCase()) {
      $('#notes-input-error-box').text('Note already added!').slideDown(300);
      return;
    }
  }
 
  var date = new Date(parseInt(noteId.substr(5)));
  $('#notes-list-cont ul').append(getNoteTemplate(noteId, noteText, date));

  var noteInfo = noteId + ":" + encodeURIComponent(noteText);
  NOTES_LIST.push(noteInfo);
  addNoteInStore(SESSION_STORE, noteInfo);
  attachNoteOptionBtnListener();
}

/* Add the note in record. */
function addNoteInStore(userId, noteInfo) {
  var filePath = './data-store/user-store/' + userId + '/note-store-dir/';
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  var info = noteInfo.split(":");
  fs.appendFileSync(filePath + '/' + 'note_list.txt', info[0] + '\n');
  fs.writeFileSync(filePath + '/' + info[0] + '.txt', info[1]);
}

/* Load the notes list. */
function loadNotesList(userId) {
  $('#notes-list-cont ul').html('');
  var filePath = './data-store/user-store/' + userId + '/note-store-dir/note_list.txt';
  if (!fs.existsSync(filePath)) {
    return;
  } else {
    var notesList = fs.readFileSync(filePath).toString().split("\n");
    notesList.pop();
    NOTES_LIST = [];
 
    for (var i = 0; i < notesList.length; i++) {
      var data = decodeURIComponent(fs.readFileSync('./data-store/user-store/' + userId + '/note-store-dir/' + notesList[i] + '.txt').toString());
      NOTES_LIST.push(notesList[i] + ":" + encodeURIComponent(data));
      var date = new Date(parseInt(notesList[i].substr(5)));
      $('#notes-list-cont ul').append(getNoteTemplate(notesList[i], data, date));
    }
  }
  attachNoteOptionBtnListener();
}

/* Delete the task from the record. */
function deleteNoteFromStore(userId, noteId) {
  var filePathA = './data-store/user-store/' + userId + '/note-store-dir';
  var filePathB = filePathA + '/note_list.txt';

  if (!fs.existsSync(filePathB)) {
    return;
  } else {
    var finalList = "";
    var list = fs.readFileSync(filePathB).toString().split("\n");
    list.pop();

    for (var i = 0; i < list.length; i++) {
      if (list[i].split(":")[0] === noteId) {
        list.splice(i, 1);
      } else {
        finalList += list[i] + '\n';
      }
    }

    fs.writeFileSync(filePathB, finalList);
    fs.unlinkSync(filePathA + '/' + noteId + '.txt');

    for (var i = 0; i < NOTES_LIST.length; i++) {
      if (NOTES_LIST[i].split(":")[0] === noteId) {
        NOTES_LIST.splice(i, 1);
        break;
      }
    }
  }
}

function getNoteTemplate(noteId, noteText, date) {
  var noteNode = '<li class="list-group-item" id="' + noteId + '">' + 
    '<span class="note-text">' + noteText + '<br />' + 
    '<span class="note-date">' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + '</span>' + 
    '</span>' + 
    '<div class="delete-note-btn">' + 
    '<span><i class="fa fa-trash-alt"></i></span>' + 
    '</div>' + 
    '</li>';

  return noteNode;
}


$(function () {
  $('#notes-icon').click(function () {
    $('#notes-pane').slideDown(300);
    loadNotesList(SESSION_STORE);
  });

  $('#notes-pane-close-btn').click(function () {
    $('#notes-list-cont ul').html('');
    $('#notes-pane').slideUp(300);
  });
});

/* To hide the error message below the input form when a key is pressed again. */
$(function () {
  $('#notes-text-input').on('keydown', function (e) {
    if (e.keyCode === KeyCodes.ENTER) {

      // If control + enter is pressed more than once then show the error in red color.
      if ($('#notes-input-error-box').text().length > 1) {
        $('#notes-input-error-box').css('color', 'red');
      }
    } else if (e.keyCode === KeyCodes.CONTROL) {
      return;
    } else {
      $('#notes-input-error-box').text("").slideUp(300).css('color', 'black');
    }
  });
});

/* Attaching click listeners on various options of the task. */
function attachNoteOptionBtnListener() {
  $(function () {
    /* Unbind the previous ones. */
    $('.delete-note-btn').unbind('click');

    /* Attach new ones. */
    $('.delete-note-btn').click(function () {
      // Remove error message if add task modal is open.
      $('#note-input-error-box').text("").slideUp(300).css('color', 'black');
      var nodeId = $(this).parent().attr('id');
      $('#' + nodeId).remove();
      deleteNoteFromStore(SESSION_STORE, nodeId);
    });
  });
}
