"use strict";

const { contextBridge, ipcRenderer } = require("electron");

const CHANNELS = Object.freeze({
  GET_APP_VERSION: "app:get-version",
  GET_CONFIG_VALUE: "app:get-config-value",
  OPEN_EXTERNAL_URL: "app:open-external-url",
});

const isSafeChannel = (channel) => Object.values(CHANNELS).includes(channel);

contextBridge.exposeInMainWorld("desktopBridge", {
  /**
   * Retrieves the application version from the main process.
   *
   * @returns {Promise<string>} Semantic version string.
   */
  getAppVersion: () => ipcRenderer.invoke(CHANNELS.GET_APP_VERSION),

  /**
   * Requests a configuration value that the main process exposes.
   * The main process is responsible for deciding which keys are allowed.
   *
   * @param {string} key - The configuration key to retrieve.
   * @returns {Promise<unknown>} The configuration value, or undefined.
   */
  getConfigValue: (key) => {
    if (typeof key !== "string" || key.length === 0) {
      return Promise.reject(
        new Error("Config key must be a non-empty string.")
      );
    }
    return ipcRenderer.invoke(CHANNELS.GET_CONFIG_VALUE, key);
  },

  /**
   * Asks the main process to open a URL in the user's default browser.
   *
   * @param {string} targetUrl - The URL to open.
   */
  openExternalUrl: (targetUrl) => {
    if (typeof targetUrl !== "string" || !targetUrl.startsWith("http")) {
      throw new Error("Only http(s) URLs are permitted.");
    }
    ipcRenderer.send(CHANNELS.OPEN_EXTERNAL_URL, targetUrl);
  },

  /**
   * Registers a one-time listener for approved channels.
   *
   * @param {string} channel - Channel name to listen to.
   * @param {Function} listener - Callback invoked when the event fires.
   * @returns {Function} Call to remove the registered listener.
   */
  once: (channel, listener) => {
    if (!isSafeChannel(channel)) {
      throw new Error(`Channel "${channel}" is not permitted.`);
    }
    const wrapped = (_event, ...args) => listener(...args);
    ipcRenderer.once(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  },

  /**
   * Registers a persistent listener for approved channels.
   *
   * @param {string} channel - Channel name to listen to.
   * @param {Function} listener - Callback invoked whenever the event fires.
   * @returns {Function} Call to remove the registered listener.
   */
  on: (channel, listener) => {
    if (!isSafeChannel(channel)) {
      throw new Error(`Channel "${channel}" is not permitted.`);
    }
    const wrapped = (_event, ...args) => listener(...args);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  },
});
