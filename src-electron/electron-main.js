import { app, BrowserWindow, Menu, ipcMain, shell } from 'electron'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const platform = process.platform || os.platform()
const currentDir = fileURLToPath(new URL('.', import.meta.url))

let mainWindow
const dashboardSectionWindows = new Map()

function resolvePreloadPath() {
  return path.resolve(
    currentDir,
    path.join(
      process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
      `electron-preload${process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION}`,
    ),
  )
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'),
    width: 1440,
    height: 900,
    minWidth: 1180,
    minHeight: 720,
    show: false,
    title: 'DashboardLogs',
    backgroundColor: '#050505',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: resolvePreloadPath(),
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isDashboardWindowUrl(url)) {
      openDashboardSectionWindow({ url, sectionId: getSectionIdFromUrl(url) })
      return { action: 'deny' }
    }

    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL)
  } else {
    await mainWindow.loadFile('index.html')
  }

  if (process.env.DEBUGGING) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function buildChildWindow({ sectionId, width = 1280, height = 900 }) {
  const childWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'),
    width,
    height,
    minWidth: 980,
    minHeight: 680,
    show: false,
    title: `DashboardLogs - ${sectionId}`,
    backgroundColor: '#050505',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: resolvePreloadPath(),
    },
  })

  childWindow.once('ready-to-show', () => {
    childWindow.show()
  })

  childWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isDashboardWindowUrl(url)) {
      openDashboardSectionWindow({ url, sectionId: getSectionIdFromUrl(url) })
      return { action: 'deny' }
    }

    shell.openExternal(url)
    return { action: 'deny' }
  })

  childWindow.on('closed', () => {
    dashboardSectionWindows.delete(sectionId)
    broadcastToDashboardWindows('dashboard-window:closed', { sectionId })
  })

  return childWindow
}

async function openDashboardSectionWindow({ url, sectionId, width, height }) {
  if (!url || !sectionId) return false

  const existingWindow = dashboardSectionWindows.get(sectionId)
  if (existingWindow && !existingWindow.isDestroyed()) {
    existingWindow.focus()
    return true
  }

  const childWindow = buildChildWindow({ sectionId, width, height })
  dashboardSectionWindows.set(sectionId, childWindow)

  await childWindow.loadURL(url)
  return true
}

function getSectionIdFromUrl(url) {
  try {
    const parsedUrl = new URL(url)
    const hashPath = parsedUrl.hash.replace(/^#/, '')
    const match = hashPath.match(/\/client\/escritorio\/section\/([^/?#]+)/)
    return match ? decodeURIComponent(match[1]) : ''
  } catch {
    return ''
  }
}

function isDashboardWindowUrl(url) {
  return Boolean(getSectionIdFromUrl(url))
}

function broadcastToDashboardWindows(channel, payload, senderWebContentsId = null) {
  BrowserWindow.getAllWindows().forEach((windowRef) => {
    if (windowRef.isDestroyed()) return
    if (senderWebContentsId && windowRef.webContents.id === senderWebContentsId) return
    windowRef.webContents.send(channel, payload)
  })
}

ipcMain.handle('dashboard-window:open-section', async (event, payload = {}) => {
  return openDashboardSectionWindow(payload)
})

ipcMain.on('dashboard-sync:broadcast', (event, payload) => {
  broadcastToDashboardWindows('dashboard-sync:payload', payload, event.sender.id)
})

Menu.setApplicationMenu(null)

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
