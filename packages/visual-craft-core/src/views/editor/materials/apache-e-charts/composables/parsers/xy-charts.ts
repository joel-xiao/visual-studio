/**
 * XY 轴图表 (Bar, Line, Scatter) 数据解析
 */
export function parseXY(options: any, rawData?: any[]) {
    if (!options.series || !Array.isArray(options.series)) return;
    if (!Array.isArray(rawData) || rawData.length === 0) return;

    const firstSeries = options.series[0];
    const type = firstSeries.type;

    if (['bar', 'line', 'scatter'].includes(type)) {
        // 映射数据值
        firstSeries.data = rawData.map((item: any) => item.value ?? item.val ?? item[1] ?? item);

        // 映射 X 轴类目
        if (options.xAxis && !Array.isArray(options.xAxis)) {
            options.xAxis.data = rawData.map((item: any) => item.name || item.label || item[0] || item);
        }
    }
}
