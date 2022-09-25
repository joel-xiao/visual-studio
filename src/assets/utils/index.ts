export const getPlatform = function (): string | undefined {
  const isWin = navigator.platform === 'Win32' || navigator.platform === 'Windows';
  if (isWin) return 'Win';
  const isMac =
    navigator.platform === 'Mac68K' ||
    navigator.platform === 'MacPPC' ||
    navigator.platform === 'Macintosh' ||
    navigator.platform === 'MacIntel';
  if (isMac) return 'Mac';
};
