
import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的 API 给渲染进程（避免直接暴露 ipcRenderer）
contextBridge.exposeInMainWorld('electron', {
  // IPC 调用方法
  invoke: (channel: string, ...args: any[]) => {
    // 限制允许的通道，增强安全性
    const validChannels = ['get-app-info'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`禁止调用未授权的 IPC 通道: ${channel}`);
  },
  // 发送事件
  send: (channel: string, ...args: any[]) => {
    const validChannels = ['ui-event', 'log-event'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },
  // 监听事件
  on: (channel: string, listener: (...args: any[]) => void) => {
    const validChannels = ['app-event', 'update-event'];
    if (validChannels.includes(channel)) {
      const subscription = ipcRenderer.on(channel, (_, ...args) => listener(...args));
      // 返回取消订阅函数
      return () => subscription.dispose();
    }
    throw new Error(`禁止监听未授权的 IPC 通道: ${channel}`);
  },
  // 环境标识
  isElectron: true,
  platform: process.platform // 暴露操作系统平台（如 win32、darwin、linux）
});

