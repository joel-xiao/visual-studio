export function noElectron() {
  const userAgent = window?.navigator?.userAgent?.toLowerCase();
  return !userAgent?.includes('electron/');
}

export function isElectron() {
  return !noElectron();
}
