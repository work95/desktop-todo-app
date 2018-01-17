/* Common key codes. */
const KeyCodes = {
  "ESCAPE": 27,
  "CONTROL": 17,
  "SHIFT": 16,
  "ALT": 18,
  "ENTER": 13
};

/* For performing operations when certain key combinations are pressed. */
$(function () {
  var keyCombination = "";
  $(window).on('keydown', function (e) {
    // Close the task text dialog box when escape key is pressed.
    if (e.keyCode === KeyCodes.ESCAPE) {
      keyCombination = "";
      $('#task-add-input-box').slideUp(250).children('input').val("");
      $('#task-input-error-box').html("");
    }

    if (e.keyCode === KeyCodes.CONTROL) {
      keyCombination = "";
    }

    keyCombination += e.keyCode;    // Concatenate the key code.
    if (keyCombination.match(/^[1][7](82)+$/i) !== null) {
      e.preventDefault();
    }

    // If the last key code forms 1723 (that means ctrl + enter is pressed together).
    if (keyCombination.match(/^[1][7](13)+$/i) !== null) {
      addTask($('#task-text-input').val(), 'task_' + new Date().getTime());
    }
    if (keyCombination == "1784") {
      $('#task-add-input-box').slideDown(250);
      $('#task-text-input').focus();
    }
  });
});
