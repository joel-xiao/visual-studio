import { IScene } from '../types';
import { aiApi } from '@/service/api/ai';
import { chartColorsSearch, type ChartColorsNameType, globalThemeJson } from '../../hooks/chart-themes-context/data';
import { useChartThemesContext } from '../../hooks/chart-themes-context';
import { generateChartData, parseJsonContent } from './dashboard-design';

export const ChartCreationScene: IScene = {
  id: 'scene2',
  label: '场景2: 智能图表生成',
  value: 'scene2',
  description: '单图表生成：对话式创建与调整 ECharts 图表',

  async run(addMessage, generateApi, params) {
    if (!params) {
      addMessage('assistant', '📊 我是您的图表生成助手。\n请先选择一个喜欢的主题风格，然后描述您想要创建的图表。', 'theme-selection');
      return;
    }

    // 1. 主题识别
    const { getCurrentTheme, setTheme } = useChartThemesContext();
    let themeName: ChartColorsNameType = getCurrentTheme().value as ChartColorsNameType;

    // Try to detect theme from params if user explicitly mentions it
    const knownThemes = Object.keys(chartColorsSearch) as ChartColorsNameType[];
    let themeDetected = false;
    for (const t of knownThemes) {
        if (params.toLowerCase().includes(t.toLowerCase())) {
            themeName = t;
            themeDetected = true;
            break;
        }
    }

    if (themeDetected) {
        setTheme(themeName);
        addMessage('assistant', `🎨 已切换主题为: **${themeName}**`);
    }

    const themeColors = chartColorsSearch[themeName] || chartColorsSearch['dark'];

    // 2. 分析意图并生成图表
    const msgId = addMessage('assistant', 'Thinking...', 'text');

    try {
        // Step 2.1: Determine Chart Type and Title
        const analyzePrompt = `Analyze the user input: "${params}".
        Extract the desired chart type (must be one of: bar, line, pie, radar, scatter, candlestick) and a suitable title.
        Return JSON: { "type": "bar", "title": "Sales Report" }`;

        const analyzeRes = await aiApi.chat({
            provider: 'qwen',
            messages: [{ role: 'user', content: analyzePrompt }]
        });

        const analysis = parseJsonContent<{type: string, title: string}>(analyzeRes.content);
        const chartType = analysis.type || 'bar';
        const chartTitle = analysis.title || 'Chart';

        // Step 2.2: Generate Options using the shared generator
        addMessage('assistant', '正在生成图表配置...', 'text', undefined, msgId);

        const options = await generateChartData(chartTitle, chartType, themeColors, globalThemeJson, (delta) => {
             // Optional: Streaming updates if ChartMessage supports it
        });

        // Step 2.3: Show Chart Message
        // Ensure options is valid
        if (options && Object.keys(options).length > 0) {
             addMessage('assistant', `已为您生成 **${chartTitle}** (${chartType})`, 'chart', undefined, msgId, {
                options: options,
                chartType: chartType,
                title: chartTitle
            });
        } else {
            throw new Error('Generated chart options are empty');
        }

    } catch (e) {
        console.error(e);
        addMessage('assistant', '生成失败: ' + (e instanceof Error ? e.message : String(e)), 'text', undefined, msgId, { isError: true });
    }
  }
};
