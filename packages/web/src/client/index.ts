import type { App } from 'vue';
import type { InvokeArgs } from '@tauri-apps/api/core';
import { invokeTauri, isTauri, noTauri } from './tauri/main';
import { isElectron, noElectron } from './electron/main';

function isClient() {
  return isElectron() || isTauri();
}

function noClient() {
  return noElectron() && noTauri();
}

export function invokeClient(cmd: string, args?: InvokeArgs) {
  invokeTauri(cmd, args);
}

export function setupNative(app: App<Element>) {
  app.config.globalProperties.$isClient = isClient;
  app.config.globalProperties.$noClient = noClient;
}
