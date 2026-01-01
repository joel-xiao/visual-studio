import type { IAIContext } from '../../hooks/core/use-ai-context';

/**
 * Theme Engine 数据应用逻辑
 * 负责更新编辑器的全局图表主题
 */
export function apply(context: IAIContext, data: any) {
    if (data.theme) {
        context.chartThemesContext.setTheme(data.theme);
    }
}
