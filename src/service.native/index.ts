import type { App } from 'vue';
import { invokeTauri, isTauri, noTauri } from './tauri/main';
import { isElectron, noElectron } from './electron/main';

function isNative() {
  return isElectron() || isTauri();
}

function noNative() {
  return noElectron() && noTauri();
}

export function invokeNative(cmd: string, args?: any) {
  invokeTauri(cmd, args);
}

export function setupNative(app: App<Element>){

  app.config.globalProperties.$isNative = isNative;
  app.config.globalProperties.$noNative = noNative;
}