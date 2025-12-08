const path = require("path");
const url = require("url");
const { app, BrowserWindow, shell, ipcMain } = require("electron");
const isDev = require("electron-is-dev");

// Load environment variables from project root (if present)
const rootEnvPath = path.resolve(__dirname, "..", "..", ".env");
require("dotenv").config({ path: rootEnvPath });

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 832;

const CHANNELS = Object.freeze({
  GET_APP_VERSION: "app:get-version",
  GET_CONFIG_VALUE: "app:get-config-value",
  OPEN_EXTERNAL_URL: "app:open-external-url",
});

const exposedConfigValues = Object.freeze({
  apiBaseUrl:
    process.env.ELECTRON_API_BASE_URL ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:5000",
  hasGoogleMapsKey: Boolean(process.env.GOOGLE_MAPS_KEY),
  hasWeatherstackKey: Boolean(process.env.WEATHERSTACK_KEY),
});

let ipcHandlersRegistered = false;

/**
 * Returns the URL the renderer process should load.
 * - During development, this points to the React dev server (npm start).
 * - In production, it loads the built React app bundled with the Electron package.
 */
function resolveAppUrl() {
  const explicitUrl = process.env.ELECTRON_START_URL;
  if (explicitUrl) {
    return explicitUrl;
  }

  if (isDev) {
    return "http://localhost:3000";
  }

  const indexPath = path.join(__dirname, "..", "frontend", "index.html");

  return url.format({
    pathname: indexPath,
    protocol: "file:",
    slashes: true,
  });
}

/**
 * Creates the main browser window for the desktop application.
 */
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#0d1b1e",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(resolveAppUrl());

  mainWindow.once("ready-to-show", () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.show();
    }
  });

  // Open external links in the user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl);
    return { action: "deny" };
  });

  return mainWindow;
}

/**
 * Sets OS-specific metadata for correct notifications and taskbar behavior.
 */
function setAppId() {
  const explicitId = process.env.ELECTRON_APP_ID || "com.hikingtrail.desktop";
  if (process.platform === "win32") {
    app.setAppUserModelId(explicitId);
  }
}

function registerIpcHandlers() {
  if (ipcHandlersRegistered) {
    return;
  }

  ipcMain.handle(CHANNELS.GET_APP_VERSION, () => app.getVersion());

  ipcMain.handle(CHANNELS.GET_CONFIG_VALUE, (_event, key) => {
    if (typeof key !== "string") {
      return undefined;
    }
    if (Object.prototype.hasOwnProperty.call(exposedConfigValues, key)) {
      return exposedConfigValues[key];
    }
    return undefined;
  });

  ipcMain.on(CHANNELS.OPEN_EXTERNAL_URL, (_event, targetUrl) => {
    if (typeof targetUrl === "string" && /^https?:\/\//i.test(targetUrl)) {
      shell.openExternal(targetUrl);
    }
  });

  ipcHandlersRegistered = true;
}

/**
 * Application entry point.
 */
function initialize() {
  setAppId();
  registerIpcHandlers();
  createMainWindow();
}

app.whenReady().then(initialize);

// Quit the application when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Re-create the window when the dock icon is clicked (macOS behavior)
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initialize();
  }
});
