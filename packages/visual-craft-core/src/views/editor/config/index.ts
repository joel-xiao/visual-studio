import { readonly, markRaw } from 'vue';

export type GetConfig = {
  (type: 'layout'): LayoutConfig;
  <T extends keyof EditorConfigMap>(type: T): EditorConfigMap[T];
  (type: string): { [key: string]: number } | undefined;
};

export type ConfigApi = {
  getConfig: GetConfig;
};

export type LayoutConfig = {
  nav_bar_height: number;
  tool_bar_height: number;
  tab_bar_height: number;
  left_menu_width: number;
  right_menu_width: number;
  ai_panel_width: number;
  ruler_size: number;
};

export type EditorConfigMap = {
  layout: LayoutConfig;
  readonly [key: string]: { [key: string]: number };
};

const baseConfig: EditorConfigMap = markRaw(
  readonly({
    layout: {
      nav_bar_height: 42,
      tool_bar_height: 0,
      tab_bar_height: 42,
      left_menu_width: 241,
      right_menu_width: 252,
      ai_panel_width: 350,
      ruler_size: 18
    }
  })
);

let injectedConfig: Partial<EditorConfigMap> | null = null;

export function initEditorConfig(config?: Partial<EditorConfigMap>) {
  injectedConfig = config ? markRaw(config) : null;
}

const getConfig: GetConfig = ((type: string) => {
  const base = baseConfig[type];
  const injected = injectedConfig?.[type];
  if (!base) return injected;
  if (!injected) return base;
  return { ...base, ...injected };
}) as GetConfig;

export function getLayoutConfig(): LayoutConfig {
  return getConfig('layout');
}

export const useConfig = function (): Readonly<ConfigApi> {
  return readonly(
    markRaw({
      getConfig
    })
  ) as Readonly<ConfigApi>;
};
