import type { IAIContext } from '../../hooks/core/use-ai-context';
import type { JsonValue } from '../../../../../@types/utils';
import { asRecord, pickString } from '../../utils/json-utils';

/**
 * Theme Engine 数据应用逻辑
 * 负责更新编辑器的全局图表主题
 */
export function apply(context: IAIContext, data: JsonValue) {
  const obj = asRecord(data) ?? {};
  const theme = pickString(obj, 'theme');
  if (theme) context.chartThemesContext.setTheme(theme);
}
