const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let notificationWindow;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 500, 
    height: 600,
    minWidth: 500,
    minHeight: 400,
    webPreferences: {
      devTools: true
    }
  });

  // Don't show the default electron window menu.
  win.setMenu(null);

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  });
}

function createNotificationWindow(x, y) {

  notificationWindow = new BrowserWindow({
    width: 400,
    height: 100,
    parent: 'top',
    webPreferences: {
      devTools: true
    },
    alwaysOnTop: true,
    resizable: false,
    toolbar: false,
    frame: false,
    x: x,
    y: y
  });

  notificationWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index_notification.html'),
    protocol: 'file:',
    slashes: true
  }));
  
  notificationWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    notificationWindow = null
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }

  if (notificationWindow === null) {
    createNotificationWindow(1600 - 300, 900 - 300);
  }
});

/* Listen to channel (notification-open) for, when to open the notification window. */
ipcMain.on('notification-open', (event, arg1, arg2, arg3, arg4) => {
  // arg1 => x; arg2 => y; arg3 => task time left; arg4 => task text.
  if (notificationWindow === undefined || notificationWindow === null) {
    createNotificationWindow(arg1, arg2);
  }
  notificationWindow.webContents.executeJavaScript('createNotificationUi("' + arg3 + '", "' + arg4 + '");');

});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.