import { InvokeArgs } from '@tauri-apps/api/tauri';
import { invoke as as_invoke } from '@tauri-apps/api/tauri';

function noTauri() {
  return !window?.__TAURI__;
}
export function invoke(cmd: string, args?: InvokeArgs) {
  if (noTauri()) return;
  as_invoke(cmd, args);
}
