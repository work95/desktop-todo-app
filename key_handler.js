/* Common key codes. */
const KeyCodes = {
  "ESCAPE": 27,
  "CONTROL": 17,
  "SHIFT": 16,
  "ALT": 18,
  "ENTER": 13
};

var OPEN_DROPDOWN_BOX = 0;

/* For performing operations when certain key combinations are pressed. */
function attachWindowKeyListener() {
  $(function () {
    $(window).unbind('keydown');

    var keyCombination = "";
    $(window).on('keydown', function (e) {
      // Close the task text dialog box when escape key is pressed.
      if (e.keyCode === KeyCodes.ESCAPE) {
        keyCombination = "";
        $('#task-add-input-box').slideUp(250).children('input').val("");
        $('#project-add-input-box').slideUp(250).children('input').val("");
        $('#task-input-error-box').html("");
        $('#project-input-error-box').html("");
      }
  
      if (e.keyCode === KeyCodes.CONTROL) {
        keyCombination = "";
      }
  
      keyCombination += e.keyCode;    // Concatenate the key code.
      if (keyCombination.match(/^[1][7](82)+$/) !== null) {
        e.preventDefault();
      }
  
      // If the last key code forms 1723 (that means ctrl + enter is pressed together).
      if (keyCombination.match(/^[1][7](13)+$/) !== null) {
        if (OPEN_DROPDOWN_BOX === 1) {
          if (LIST_CONT_STATE === 1) {
            addTask($('#task-text-input').val(), 'task_' + new Date().getTime());
          } else {
            addProjectTask($('#task-text-input').val(), 'task_' + new Date().getTime());
          }
        } else if (OPEN_DROPDOWN_BOX === 2) {
          addProject($('#project-text-input').val(), 'project_' + new Date().getTime());
        }
      }
  
      if (keyCombination === "1780") {
        OPEN_DROPDOWN_BOX = 2;
        $('#project-add-input-box').slideDown(250);
        $('#project-text-input').focus();
      } else if (keyCombination === "1784") {
        OPEN_DROPDOWN_BOX = 1;
        $('#task-add-input-box').slideDown(250);
        $('#task-text-input').focus();
      }
    });
  });  
}
