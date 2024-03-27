import type { App } from 'vue';
import { InvokeArgs } from '@tauri-apps/api/tauri';
import { invoke as as_invoke } from '@tauri-apps/api/tauri';

export function noTauri() {
  return !window?.__TAURI__;
}

export function isTauri() {
  return !noTauri();
}

export function invokeTauri(cmd: string, args?: InvokeArgs) {
  if (noTauri()) return;
  as_invoke(cmd, args);
}
