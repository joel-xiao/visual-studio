import type { IAIContext } from '../../hooks/core/use-ai-context';
import { updateChartOptionsBatch } from '../../utils/agent/apply-helpers';

/**
 * Data Analyst 数据应用逻辑
 * 负责将 AI 分析产生的数据应用到现有图表组件中
 */
export function apply(context: IAIContext, data: any) {
    const chartOptions =
        data?.chartOptions ||
        data?.chartDataMap ||
        data?.data?.chartOptions ||
        data?.data?.chartDataMap;

    if (chartOptions) {
        updateChartOptionsBatch(context, chartOptions);
    }
}
