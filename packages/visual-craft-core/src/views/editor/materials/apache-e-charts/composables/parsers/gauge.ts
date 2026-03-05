/**
 * 仪表盘数据解析与属性映射
 */
export function parseGauge(options: any, rawData?: any[]) {
    if (!options.series || !Array.isArray(options.series)) return;

    options.series.forEach((s: any) => {
        if (s.type !== 'gauge') return;

        // 1. 数据解析
        if (Array.isArray(rawData) && rawData.length > 0) {
            s.data = rawData;
        }

        // 2. 友好属性映射 (Radius/InnerRadius -> AxisLine.Width)
        const outer = s.radius !== undefined ? s.radius : 80;
        const inner = s.innerRadius !== undefined ? s.innerRadius : 60;

        s.radius = typeof outer === 'number' ? `${outer}%` : outer;

        if (s.innerRadius !== undefined) {
            s.axisLine = s.axisLine || {};
            s.axisLine.lineStyle = s.axisLine.lineStyle || {};
            s.axisLine.lineStyle.width = Math.max(0, Number(outer) - Number(inner));
        }
    });
}
