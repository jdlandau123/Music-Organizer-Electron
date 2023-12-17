const { app, BrowserWindow, ipcMain } = require('electron');
const sequelize = require('sequelize');
const func = require('./functions');

let mainWindow;

const dbConnection = new sequelize.Sequelize({
	dialect: 'sqlite',
	storage: 'C://ProgramData/Music_Organizer/db.sqlite'
});

const Album = dbConnection.define('Album', {
	artist: {
		type: sequelize.DataTypes.STRING,
		allowNull: false
	},
	album: {
		type: sequelize.DataTypes.STRING,
		allowNull: false
	},
	fileFormat: {
		type: sequelize.DataTypes.STRING,
		allowNull: false
	},
	isOnDevice: {
		type: sequelize.DataTypes.BOOLEAN,
		defaultValue: false
	},
	tracklist: {
		type: sequelize.DataTypes.JSON
	}
}, {});

function createWindow() {
  ipcMain.on('check-config', (event, arg) => {
    const config = func.checkConfig();
    event.reply('config-reply', config);
	})

  ipcMain.on('create-config', (event, arg) => {
    func.saveConfig(arg);
    event.reply('config-reply', arg);
	})

  ipcMain.on('collection-query', (event, arg) => {
		console.log(arg);
    event.reply('collection-reply', 'Query received');
	})

	mainWindow = new BrowserWindow({
		width: 1200,
		height: 700,
		backgroundColor: '#ffffff',
		icon: `file://${__dirname}/dist/assets/logo.png`,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		}
	})

	//   mainWindow.loadURL(`file://${__dirname}/dist/music-organizer-electron/index.html`)
	mainWindow.loadURL('http://localhost:4200')

	mainWindow.webContents.openDevTools()

	mainWindow.on('closed', () => {
		mainWindow = null
	})
}

// Create window on electron initialization
app.on('ready', async () => {
	// ipcMain.on('collection-query', (event, arg) => {
	// 	console.log('Query received');
	// 	console.log(arg);
  //   event.reply('Query received');
	// })
  
	await Album.sync();
	console.log('Database Synced');
	createWindow();
})

app.on('window-all-closed', () => {
	// On macOS specific close process
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// macOS specific close process
	if (mainWindow === null) {
		createWindow()
	}
})
