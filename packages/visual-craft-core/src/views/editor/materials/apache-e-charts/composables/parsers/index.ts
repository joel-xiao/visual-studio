import { parseXY } from './xy-charts';
import { parseBasic } from './basic';
import { parseGauge } from './gauge';
import { parseRadar } from './radar';
import { processStyles } from './common';

export { processStyles };

/**
 * 核心分配逻辑：根据图表类型调用对应的解析器
 */
export function transformChartOptions(options: any, rawData?: any[]) {
    if (!options.series || !Array.isArray(options.series)) return;

    // 1. 通用样式转换 (styles -> fontWeight 等)
    processStyles(options);

    // 2. 根据第一个 series 的类型进行针对性解析
    const type = options.series[0]?.type;

    switch (type) {
        case 'bar':
        case 'line':
        case 'scatter':
            parseXY(options, rawData);
            break;
        case 'pie':
        case 'funnel':
        case 'sankey':
            parseBasic(options, rawData);
            break;
        case 'gauge':
            parseGauge(options, rawData);
            break;
        case 'radar':
            parseRadar(options, rawData);
            break;
        // 其他复杂图表 (Heatmap, Treemap) 后续可继续在此扩展
    }
}
