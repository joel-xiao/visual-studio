/**
 * 雷达图数据解析
 */
export function parseRadar(options: any, rawData?: any[]) {
    if (!options.series || !Array.isArray(options.series)) return;
    if (!Array.isArray(rawData) || rawData.length === 0) return;

    const firstSeries = options.series.find((s: any) => s.type === 'radar');
    if (!firstSeries) return;

    // 映射数值
    if (!firstSeries.data || firstSeries.data.length === 0) {
        firstSeries.data = [{ value: rawData.map((item: any) => item.value ?? item), name: 'Data 1' }];
    } else {
        firstSeries.data[0].value = rawData.map((item: any) => item.value ?? item);
    }

    // 映射雷达轴指标
    if (options.radar) {
        options.radar.indicator = rawData.map((item: any) => ({
            name: item.name || item.label || '',
            max: item.max || 100
        }));
    }
}
