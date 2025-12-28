import { globalThemeJson } from '../../../hooks/chart-themes-context/data';
import type { IAIContext } from '../../hooks/core/use-ai-context';

interface IThemeData {
  theme: string;
  colors?: string[];
  [key: string]: unknown;
}

/**
 * Theme Engine Agent Apply
 */
export function apply(context: IAIContext, data: unknown): void {
  const { chartThemesContext } = context;
  const { setTheme, registerCustomTheme } = chartThemesContext;

  const dataObj = data as IThemeData;
  if (!dataObj?.theme) return;

  // 注册自定义主题（如果有颜色配置）
  if (dataObj.colors && Array.isArray(dataObj.colors)) {
    const newTheme = { ...globalThemeJson, color: dataObj.colors };
    registerCustomTheme(dataObj.theme, newTheme);
  }

  // 应用主题
  setTheme(dataObj.theme);
}

