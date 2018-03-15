var NOTES_LIST = [];
var NOTES_LIST_CONT_STATE = 0;

function addNote(noteText, noteId) {
  for (let i = 0; i < NOTES_LIST.length; i++) {
    if (encodeURIComponent(noteText).toLowerCase() === NOTES_LIST[i].split(":")[1].toLowerCase()) {
      $('#notes-input-error-box').text('Note already added!').slideDown(300);
      return;
    }
  }
 
  let date = new Date(parseInt(noteId.substr(5)));
  $('#notes-list-cont ul').append(getNoteTemplate(noteId, noteText, date));

  let noteInfo = noteId + ":" + encodeURIComponent(noteText);
  NOTES_LIST.push(noteInfo);
  addNoteInStore(SESSION_STORE, noteInfo);
  attachNoteOptionBtnListener();
}

/* Add the note in record. */
function addNoteInStore(userId, noteInfo) {
  let filePath = './data-store/user-store/' + userId + '/note-store-dir/';
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  let info = noteInfo.split(":");
  fs.appendFileSync(filePath + '/' + 'note_list.txt', info[0] + '\n');
  fs.writeFileSync(filePath + '/' + info[0] + '.txt', info[1]);
  porting.portProfile(SESSION_STORE, null);
}

/* Load the notes list. */
function loadNotesList(userId) {
  $('#notes-list-cont ul').html('');
  let filePath = './data-store/user-store/' + userId + '/note-store-dir/note_list.txt';
  if (!fs.existsSync(filePath)) {
    return;
  } else {
    let notesList = fs.readFileSync(filePath).toString().split("\n");
    notesList.pop();
    NOTES_LIST = [];
 
    for (let i = 0; i < notesList.length; i++) {
      let data = decodeURIComponent(fs.readFileSync('./data-store/user-store/' + userId + '/note-store-dir/' + notesList[i] + '.txt').toString());
      NOTES_LIST.push(notesList[i] + ":" + encodeURIComponent(data));
      let date = new Date(parseInt(notesList[i].substr(5)));
      $('#notes-list-cont ul').append(getNoteTemplate(notesList[i], data, date));
    }
  }
  attachNoteOptionBtnListener();
}

/* Delete the task from the record. */
function deleteNoteFromStore(userId, noteId) {
  let filePathA = './data-store/user-store/' + userId + '/note-store-dir';
  let filePathB = filePathA + '/note_list.txt';

  if (!fs.existsSync(filePathB)) {
    return;
  } else {
    let finalList = "";
    let list = fs.readFileSync(filePathB).toString().split("\n");
    list.pop();

    for (let i = 0; i < list.length; i++) {
      if (list[i].split(":")[0] === noteId) {
        list.splice(i, 1);
        break;
      }
    }
    
    for (let i = 0; i < list.length; i++) {
        finalList += list[i] + '\n';
    }

    fs.writeFileSync(filePathB, finalList);
    fs.unlinkSync(filePathA + '/' + noteId + '.txt');

    for (let i = 0; i < NOTES_LIST.length; i++) {
      if (NOTES_LIST[i].split(":")[0] === noteId) {
        NOTES_LIST.splice(i, 1);
        break;
      }
    }
  }
  porting.portProfile(SESSION_STORE, null);
}

function getNoteTemplate(noteId, noteText, date) {
  let noteNode = '<li class="list-group-item" id="' + noteId + '">' + 
    '<span class="note-text">' + noteText + '<br />' + 
    '<span class="note-date">' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + '</span>' + 
    '</span>' + 
    '<div class="delete-note-btn">' + 
    '<span><i class="fa fa-trash-alt"></i></span>' + 
    '</div>' + 
    '</li>';

  return noteNode;
}

function showNotesListCont() {
  $('#notes-pane').slideDown(300);
  loadNotesList(SESSION_STORE);
}

function closeNotesListCont() {
  $('#notes-list-cont ul').html('');
  $('#notes-pane').slideUp(300);
  showMainTaskListCont();
}

$(function () {
  $('#notes-icon').click(function () {
    showNotesListCont();
  });

  $('#notes-pane-close-btn').click(function () {
    closeNotesListCont();
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
      let nodeId = $(this).parent().attr('id');
      $('#' + nodeId).remove();
      deleteNoteFromStore(SESSION_STORE, nodeId);
    });
  });
}
