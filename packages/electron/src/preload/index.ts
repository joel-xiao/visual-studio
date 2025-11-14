import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, ...args: any[]) => {
    const validChannels = ['get-app-info'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    return Promise.reject(new Error(`禁止调用未授权的 IPC 通道: ${channel}`));
  },

  send: (channel: string, ...args: any[]) => {
    const validChannels = ['ui-event', 'log-event'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
      return true;
    }
    console.error(`禁止发送未授权的 IPC 通道: ${channel}`);
    return false;
  },

  on: (channel: string, listener: (...args: any[]) => void) => {
    const validChannels = ['app-event', 'update-event'];
    if (validChannels.includes(channel)) {
      const subscription = (event: any, ...args: any[]) => listener(...args);
      ipcRenderer.on(channel, subscription);
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }
    console.error(`禁止监听未授权的 IPC 通道: ${channel}`);
    return () => {};
  },

  isElectron: true,
  platform: process.platform
});

