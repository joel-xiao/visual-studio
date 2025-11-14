import type { App } from 'vue';
import { invoke as as_invoke } from '@tauri-apps/api/core';

type InvokeArgs = Parameters<typeof as_invoke>[1];

declare global {
  interface Window {
    __TAURI__?: {
      invoke: typeof as_invoke;
    };
  }
}

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
