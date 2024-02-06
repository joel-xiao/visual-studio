import type { App } from 'vue';
import { InvokeArgs } from '@tauri-apps/api/tauri';
import { invoke as as_invoke } from '@tauri-apps/api/tauri';

function noTauri() {
  return !window?.__TAURI__;
}

function isTauri() {
  return !noTauri();
}

export function invoke(cmd: string, args?: InvokeArgs) {
  if (noTauri()) return;
  as_invoke(cmd, args);
}

export function setupTauri(app: App<Element>) {
  app.config.globalProperties.$isTauri = isTauri;
  app.config.globalProperties.$noTauri = noTauri;
}
