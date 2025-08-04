import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

// 处理 __dirname 定义（避免重复）
var __dirname = typeof __dirname !== 'undefined' 
  ? __dirname 
  : path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // 开发环境允许跨域访问 Web 服务
    }
  });

  // 强制使用 Web 服务的端口（1420）
  const webServerUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:1420'  // 开发环境：直接连接 Web 服务
    : `file://${join(__dirname, '../../web/dist/index.html')}`; // 生产环境：加载打包文件

  mainWindow.loadURL(webServerUrl);

  // 开发环境打开调试工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
