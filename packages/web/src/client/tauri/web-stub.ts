/**
 * Web stub for Tauri API
 * Used when building for web mode to prevent Tauri code from being included
 */

export type InvokeArgs = Record<string, unknown>;

/**
 * Check if running in Tauri environment
 * Always returns false in web mode
 */
export function isTauri(): boolean {
  return false;
}

/**
 * Invoke Tauri command
 * Always returns undefined in web mode
 */
export async function invoke<T = unknown>(
  _cmd: string,
  _args?: InvokeArgs
): Promise<T | undefined> {
  return undefined;
}

