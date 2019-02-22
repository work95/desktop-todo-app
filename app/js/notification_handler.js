const electron = require("electron");
const {ipcRenderer} = require("electron");

module.exports = {
  showNotification: function (taskInfo) {
    let screenSize = electron.screen.getPrimaryDisplay().size;
    ipcRenderer.send('notification-open',
      screenSize.width - 320,
      50,
      taskInfo.left,
      taskInfo.text
    );
  }
};
