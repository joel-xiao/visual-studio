import type { IAIContext } from '../../hooks/core/use-ai-context';
import { updateChartOptionsBatch } from '../../utils/agent/apply-helpers';
import { asRecord } from '../../utils/json-utils';
import type { JsonValue } from '../../../../../@types/utils';

/**
 * Data Analyst 数据应用逻辑
 * 负责将 AI 分析产生的数据应用到现有图表组件中
 */
export function apply(context: IAIContext, data: unknown) {
    const d = asRecord(data) ?? {};
    const dataObj = asRecord(d.data) ?? {};

    const raw =
        asRecord(d.chartOptions) ||
        asRecord(d.chartDataMap) ||
        asRecord(dataObj.chartOptions) ||
        asRecord(dataObj.chartDataMap);

    if (!raw) return;

    const chartOptions: Record<string, Record<string, JsonValue>> = {};
    for (const [nodeId, opts] of Object.entries(raw)) {
        const obj = asRecord(opts);
        if (obj) chartOptions[nodeId] = obj;
    }

    updateChartOptionsBatch(context, chartOptions);
}
