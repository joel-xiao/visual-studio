export function noElectron() {
  return !window?.electron;
}

export function isElectron() {
  return !!window?.electron;
}

export function invokeElectron(cmd: string, args?: any) {
  const invoke = window?.electron?.invoke;
  if (noElectron()) return;
  if(!invoke) throw new Error('Electron 通信 API 未加载');
  invoke(cmd, args);
}
