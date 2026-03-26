const { app, BrowserWindow, Tray, Menu, nativeImage, Notification, ipcMain } = require('electron')
const path = require('path')

let mainWindow = null
let tray = null
let isQuitting = false

const isDev = !app.isPackaged

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 480,
    minHeight: 500,
    frame: true,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f0d0b',
    icon: path.join(__dirname, '../public/favicon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createTray() {
  // Create a simple 16x16 tray icon
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA2ElEQVR42mNkoBAwUqifYdAYwMjIuJ+BgeE/Ax7AxMCAPwAZgNQwkGYAE8kGMDGgByB7BUwgNYzIgQMKGPAFIhMDA8N+qCH/oTQTVA0DXAEDA8N/BixgP1TtfwZcYD9UzX8GXAAq+T9UzX8GXGA/VM1/BlxgP1TNfwZcYD9UzX8GXAAq+T9UzX8GXGA/VM1/BlxgP1TNfwZcYD9UzX8GXAAq+T9UzX8GXGA/VM1/BlxgP1TNfwZcYD9UzX8GXGA/VM1/BlxgP1TNfwZcYD9UzX8GfGAQAACk6GmrGjv+QQAAAABJRU5ErkJggg=='
  )
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open FocusForge',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setToolTip('FocusForge — Stay Focused')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus()
      } else {
        mainWindow.show()
      }
    }
  })
}

// Handle nag notification from renderer
ipcMain.on('show-nag', (_event, { title, body }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title || 'FocusForge',
      body: body || 'Check your current task!',
      urgency: 'critical',
      silent: false,
    })
    notification.on('click', () => {
      if (mainWindow) {
        mainWindow.show()
        mainWindow.focus()
      }
    })
    notification.show()
  }

  // Also flash the taskbar
  if (mainWindow && !mainWindow.isFocused()) {
    mainWindow.flashFrame(true)
  }
})

// Bring window to front on nag
ipcMain.on('bring-to-front', () => {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.setAlwaysOnTop(true)
    mainWindow.focus()
    // Remove always-on-top after a short delay
    setTimeout(() => {
      if (mainWindow) mainWindow.setAlwaysOnTop(false)
    }, 3000)
  }
})

app.whenReady().then(() => {
  createWindow()
  createTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  } else if (mainWindow) {
    mainWindow.show()
  }
})

app.on('before-quit', () => {
  isQuitting = true
})
