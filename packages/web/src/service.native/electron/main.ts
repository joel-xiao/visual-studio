export function noElectron() {
  const userAgent = window?.navigator?.userAgent?.toLowerCase();
  return !userAgent?.includes('electron/');
}

export function isElectron() {
  return !noElectron();
}

export function invokeElectron(cmd: string, args?: any) {
  const invoke = window?.electron?.invoke;
  if (noElectron()) return;
  if(!invoke) throw new Error('Electron 通信 API 未加载');
  invoke(cmd, args);
}
