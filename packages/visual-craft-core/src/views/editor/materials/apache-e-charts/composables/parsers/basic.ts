/**
 * 基础分布类图表 (Pie, Funnel) 数据解析
 */
export function parseBasic(options: any, rawData?: any[]) {
    if (!options.series || !Array.isArray(options.series)) return;
    if (!Array.isArray(rawData) || rawData.length === 0) return;

    const firstSeries = options.series[0];
    const type = firstSeries.type;

    if (['pie', 'funnel', 'sankey'].includes(type)) {
        // 直接映射对象数组 { name, value }
        firstSeries.data = rawData;
    }
}
