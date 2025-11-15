import type { InvokeArgs } from '@tauri-apps/api/core';
import { invoke, isTauri as tauriIsTauri } from '@tauri-apps/api/core';

export function noTauri(): boolean {
  return !tauriIsTauri();
}

export function isTauri(): boolean {
  return tauriIsTauri();
}

export async function invokeTauri<T = unknown>(
  cmd: string,
  args?: InvokeArgs
): Promise<T | undefined> {
  if (noTauri()) {
    return undefined;
  }
  return await invoke<T>(cmd, args);
}
