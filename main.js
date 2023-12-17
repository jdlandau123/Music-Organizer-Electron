const { app, BrowserWindow, ipcMain } = require('electron')

let win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1200, 
    height: 700,
    backgroundColor: '#ffffff',
    icon: `file://${__dirname}/dist/assets/logo.png`,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
    }
  })

ipcMain.on('test', (event, arg) => {
    console.log(arg);
    win.webContents.send('other-custom-signal', 'message from the backend process');
});


//   win.loadURL(`file://${__dirname}/dist/music-organizer-electron/index.html`)
  win.loadURL('http://localhost:4200')

  //// uncomment below to open the DevTools.
  // win.webContents.openDevTools()

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  })
}

// Create window on electron initialization
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
})