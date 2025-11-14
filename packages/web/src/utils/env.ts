export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;
export const mode = import.meta.env.MODE;

export const buildTarget = (() => {
  if (mode === 'electron' || mode === 'tauri') {
    return mode;
  }
  return 'web';
})();

export const isWeb = buildTarget === 'web';
export const isElectron = buildTarget === 'electron';
export const isTauri = buildTarget === 'tauri';
export const isDesktop = isElectron || isTauri;

export const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';
export const appTitle = import.meta.env.VITE_APP_TITLE || 'Visualization Editor';
export const appVersion = import.meta.env.VITE_APP_VERSION || '0.0.1';

