import { IScene } from '../types';
import { aiApi } from '@/service/api/ai';
import { chartColorsSearch, type ChartColorsNameType, globalThemeJson } from '../../../../hooks/chart-themes-context/data';
import { useNodeContext } from '../../../../hooks/node-context';
import { useChartThemesContext } from '../../../../hooks/chart-themes-context';

// 用户提供的示例 JSON 结构，作为 Few-Shot 示例或 Schema 参考
const layoutSchema = {
  "folder": "",
  "id": "",
  "type": "",
  "name": "",
  "nodes": [
    {
      "parentId": "",
      "id": "root",
      "icon": "",
      "component": "root",
      "schema": "../../canvas/schema/default.ts",
      "name": "根容器",
      "width": null,
      "height": null,
      "radius": null,
      "type": "",
      "x": null,
      "y": null,
      "z": 0,
      "select": false,
      "lock": false,
      "props": {
        "layout": {
          "width": null,
          "height": null
        },
        "fill": {
          "color": "hsla(0, 0%, 13% , 1)"
        }
      }
    },
    {
      "parentId": "root",
      "id": "demo-bar",
      "name": "基础柱状图",
      "icon": "/image/dashboard/editor/materials/apache-e-charts/bar-simple.png",
      "schema": "../../materials/apache-e-charts/bar/schema/default.ts",
      "component": "../../materials/apache-e-charts/bar/index.vue",
      "props": {
        "layout": {
          "x": null,
          "y": null,
          "width": null,
          "height": null,
          "size_proportion_lock": false,
          "rotate": 0,
          "reverse-y": false,
          "reverse-x": false,
          "radius": null
        },
        "layer": {
          "blends": [
            {
              "mix": "normal",
              "opacity": 1,
              "visible": true
            }
          ]
        },
        "code": {
          "options": "{}"
        },
        "title": {
          "value": "示例标题",
          "fontFamily": "SimSun",
          "fontSize": 12,
          "color": "#fff",
          "lineHeight": "",
          "letterSpacing": ""
        }
      },
      "width": null,
      "height": null,
      "radius": null,
      "type": "",
      "x": null,
      "y": null,
      "z": null,
      "select": false,
      "lock": false
    }
  ]
};

/**
 * 辅助函数：解析 AI 返回的 JSON 内容
 * 增强版：支持 Markdown 代码块提取、大括号匹配提取、宽松 JSON 解析 (new Function)
 */
const parseJsonContent = <T = unknown>(content: string): T => {
  let jsonStr = '';

  // 1. 优先尝试匹配 Markdown 代码块
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  } else {
    // 2. 如果没有代码块，尝试从文本中提取 JSON 对象 (通过大括号计数)
    jsonStr = extractJsonObject(content);
  }

  if (!jsonStr) {
    // 降级：尝试清理首尾可能存在的标记，直接作为 JSON
    jsonStr = content.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
  }

  try {
    // 尝试标准 JSON 解析
    return JSON.parse(jsonStr);
  } catch (e) {
    try {
      // 二次尝试：如果标准解析失败，尝试使用 Function (支持 JS 对象格式，如无引号 key、尾随逗号、单引号等)
      // 注意：这里假设 AI 返回的内容是相对安全的
      return new Function('return ' + jsonStr)() as T;
    } catch (err) {
      console.error('JSON Parse Error:', e, jsonStr);
      throw e;
    }
  }
};

/**
 * 通过括号匹配提取 JSON 字符串
 */
const extractJsonObject = (str: string): string => {
  const startIndex = str.indexOf('{');
  if (startIndex === -1) return '';

  let balance = 0;
  let inString = false;
  let escape = false;

  for (let i = startIndex; i < str.length; i++) {
    const char = str[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        balance++;
      } else if (char === '}') {
        balance--;
        if (balance === 0) {
          return str.substring(startIndex, i + 1);
        }
      }
    }
  }

  // 如果没有找到平衡的结束括号，退回到原始的 substring (可能直到末尾)
  return str.substring(startIndex);
};



/**
 * 角色 1: 布局设计师
 * 职责: 根据用户需求生成大屏的布局结构 (JSON)，但不填充图表的具体数据配置。
 */
const generateLayout = async (userRequirement: string, onStream?: (content: string) => void): Promise<IEditorData> => {
  const systemPrompt = `你是一位专业的数据可视化大屏布局设计师。
你的任务是根据用户的需求（如屏幕尺寸、图表类型等），设计一个完整的大屏 JSON 结构。

### 核心要求：
1. **Strict JSON Only**: 请只输出标准的 JSON 代码，**严禁**包含 Markdown 标记（如 \`\`\`json），**严禁**包含任何解释性文字。
2. **Schema Compliance**: 输出的 JSON 结构必须严格符合下方的【参考示例】格式，确保字段完整性。
3. **Canvas Size**: 根容器 (root) 的尺寸必须严格匹配用户要求的尺寸。如果不明确，默认使用 1920*1080。
4. **Layout Algorithm (Strict)**:
   - **无重叠约束**: 任何两个组件的矩形区域 (x, y, x+width, y+height) 绝对不能有交集。请在生成前进行坐标计算校验。
   - **边界约束**: 所有子组件必须完全包含在根容器内 (x>=0, y>=0, x+w<=root.w, y+h<=root.h)。
   - **美观性**: 布局应整齐对称，充分利用画布空间，避免出现大片空白或过于拥挤。
   - **组件数量**: 除非用户指定，否则请生成 **6-10 个** 关键图表组件以丰富内容。
5. **Data Handling**: 对于所有图表节点，props.code.options 字段必须设置为空对象 {}，数据填充将由后续步骤完成。
6. **Component Mapping**: 请严格使用下方提供的【可用组件列表】中的 component, schema, icon 路径。

### 可用组件列表 (Component Registry):
   - **柱状图 (Bar)**:
     - component: "../../materials/apache-e-charts/bar/index.vue"
     - schema: "../../materials/apache-e-charts/bar/schema/default.ts"
     - icon: "/image/dashboard/editor/materials/apache-e-charts/bar-simple.png"
   - **折线图 (Line)**:
     - component: "../../materials/apache-e-charts/line/index.vue"
     - schema: "../../materials/apache-e-charts/line/schema/default.ts"
     - icon: "/image/dashboard/editor/materials/apache-e-charts/line-simple.png"
   - **饼图 (Pie)**:
     - component: "../../materials/apache-e-charts/pie/index.vue"
     - schema: "../../materials/apache-e-charts/pie/schema/default.ts"
     - icon: "/image/dashboard/editor/materials/apache-e-charts/pie-simple.png"
   - **雷达图 (Radar)**:
     - component: "../../materials/apache-e-charts/radar/index.vue"
     - schema: "../../materials/apache-e-charts/radar/schema/default.ts"
     - icon: "/image/dashboard/editor/materials/apache-e-charts/radar-simple.png"
   - **K线图 (Candlestick)**:
     - component: "../../materials/apache-e-charts/candlestick/index.vue"
     - schema: "../../materials/apache-e-charts/candlestick/schema/default.ts"
     - icon: "/image/dashboard/editor/materials/apache-e-charts/candlestick-simple.png"
   - **散点图 (Scatter)**:
     - component: "../../materials/apache-e-charts/scatter/index.vue"
     - schema: "../../materials/apache-e-charts/scatter/schema/default.ts"
     - icon: "/image/dashboard/editor/materials/apache-e-charts/scatter-simple.png"

### 参考示例 (JSON Schema Example):
${JSON.stringify(layoutSchema)}

请根据上述规则生成布局 JSON。`;

  try {
    const res = await aiApi.chat({
      provider: 'qwen',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userRequirement }
      ],
      options: { stream: !!onStream },
      onStream
    });

    const data = parseJsonContent<IEditorData>(res.content);
    return data;
  } catch (e) {
    console.error('Layout generation failed', e);
    throw e;
  }
};

/**
 * 角色 2: 数据可视化专家
 * 职责: 为给定的图表节点生成真实的 ECharts 配置数据。
 */
const generateChartData = async (chartName: string, chartType: string, themeColors: string[], themeConfig: Record<string, any>, onStream?: (content: string) => void): Promise<Record<string, unknown>> => {
  const systemPrompt = `你是一位 ECharts 数据可视化专家。
请为类型为 "${chartType}"，名称为 "${chartName}" 的图表生成一个 ECharts 的 option 配置对象 (JSON)。

### 核心任务：
1. **Strict Chart Type Enforcement**:
   - 你生成的配置 **必须** 严格对应 "${chartType}" 类型。
   - 如果 type 为 "bar"，series.type 必须为 "bar"。
   - 如果 type 为 "line"，series.type 必须为 "line"。
   - 如果 type 为 "pie"，series.type 必须为 "pie"。
   - **严禁** 根据 "${chartName}" 的语义擅自修改图表类型（例如：即使名字叫"占比"，但类型是"line"，你也必须生成折线图）。

2. **Semantic Analysis & Data Generation**:
   - 分析 "${chartName}" 的业务含义来生成 **高度真实** 的业务模拟数据（xAxis/yAxis/series.data）。
   - 示例：月份 (1月-12月)，省份 (广东, 北京...)，具体产品线 (手机, 笔记本...)。
   - 不要使用 "周一, 周二..." 或 "1, 2, 3" 这种简单数据，除非是测试图表。

### 样式与主题约束 (Strict Style Guidelines)：
1. **JSON Only**: 只输出 JSON，无 Markdown，无解释。
2. **Theme Integration**:
   - **MUST** 使用提供的配色方案: ${JSON.stringify(themeColors)}
   - **MUST** 遵循全局主题配置中的字体大小、颜色、线条样式。不要覆盖它们，除非是为了实现特定的视觉效果。
   - 背景色必须为 'transparent'。
3. **Configuration Completeness**: 必须包含 title, tooltip, legend, grid (如有), xAxis (如有), yAxis (如有), series。

### 全局主题配置 (Base Theme Config):
${JSON.stringify(themeConfig)}
`;

  try {
    const res = await aiApi.chat({
      provider: 'qwen',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请生成配置数据。` }
      ],
      options: { stream: !!onStream },
      onStream
    });

    return parseJsonContent<Record<string, unknown>>(res.content);
  } catch (e) {
    console.error(`Data generation failed for ${chartName}`, e);
    // 返回一个空对象或错误提示配置，避免整个流程中断
    return {
      title: { text: '数据生成失败', textStyle: { color: 'red' } }
    };
  }
};

export const DashboardDesignScene: IScene = {
  id: 'scene1',
  label: '场景1: 智能大屏设计',
  value: 'scene1',
  description: '双角色协作：布局设计师 -> 数据可视化专家',

  async run(addMessage, generateApi, params) {
    if (!params) {
        addMessage('assistant', '👋 您好！我是您的智能大屏设计助手。\n\n我可以帮您规划大屏布局并自动生成图表数据。请告诉我您的需求，例如：\n> “帮我设计一个销售监控大屏，包含销售趋势、地区分布和产品占比图”');
        return;
    }

    // --- 阶段 0: 意图识别与主题应用 ---
    const { getCurrentTheme, setTheme } = useChartThemesContext();
    let themeName: ChartColorsNameType = getCurrentTheme().value as ChartColorsNameType;

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
        addMessage('assistant', `🎨 已识别设计风格: **${themeName}**，将为您应用相应的主题配色。`);
    } else {
        addMessage('assistant', `🎨 使用当前主题: **${themeName}** 进行设计。`);
    }

    const themeColors = chartColorsSearch[themeName] || chartColorsSearch['dark'];

    // --- 阶段 1: 布局设计 ---
    addMessage('assistant', '🤖 **AI 布局设计师** 正在思考...\n正在规划大屏的整体结构和组件分布。');
    let layoutResult: IEditorData | undefined;

    const layoutMsgId = addMessage('assistant', '正在生成布局 JSON...', 'code');
    let layoutFullContent = '';

    try {
        layoutResult = await generateLayout(params, (delta) => {
            layoutFullContent += delta;
            addMessage('assistant', layoutFullContent, 'code', undefined, layoutMsgId);
        });
        addMessage('assistant', '✅ **布局设计完成**！已将大屏框架应用到编辑器。');

        // 应用布局到编辑器
        const nodeContext = useNodeContext();
        if (layoutResult) {
            nodeContext.update(layoutResult);
        }

    } catch (error) {
        addMessage('assistant', '❌ 布局生成过程中遇到错误: ' + error);
        return;
    }

    // --- 阶段 2: 数据填充 ---
    addMessage('assistant', '📊 **AI 数据可视化专家** 已接手任务...\n正在为每个图表注入真实的业务模拟数据。');

    if (layoutResult && layoutResult.nodes) {
        let processedCount = 0;
        const nodeContext = useNodeContext();

        // 串行处理所有图表节点的数据生成，确保多角色流程有序
        for (const node of layoutResult.nodes) {
            if (node.id === 'root') continue;

            // 简单判断是否为图表组件 (根据 component 路径或 name)
            if (node.component && node.component.includes('apache-e-charts')) {
                const chartMsgId = addMessage('assistant', `🔄 正在生成组件 **[${node.name}]** 的数据配置...`, 'code');
                let chartContent = '';

                // 从 component 路径提取图表类型 (e.g., .../apache-e-charts/line/index.vue -> line)
                // 确保传给 AI 的 chartType 是准确的物理类型，而非可能含糊的 node.name
                const chartType = node.component.split('apache-e-charts/')[1]?.split('/')[0] || 'bar';

                try {
                    const options = await generateChartData(node.name, chartType, themeColors, globalThemeJson, (delta) => {
                        chartContent += delta;
                        addMessage('assistant', chartContent, 'code', undefined, chartMsgId);
                    });

                    // 填充数据到编辑器节点
                    const value = typeof options === 'object' ? JSON.stringify(options, null, 2) : options;
                    nodeContext.updateNodeProps(node.id, { key: 'code.options', value }, false);
                    processedCount++;

                } catch (err) {
                    console.error(`Failed to generate data for ${node.name}`, err);
                    addMessage('assistant', `⚠️ 组件 **[${node.name}]** 数据生成失败，已跳过。`);
                }
            }
        }

        addMessage('assistant', `🎉 **大屏设计全部完成！**\n共生成了 ${processedCount} 个图表的数据。您现在可以在编辑器中自由调整。`);
    }
  }
};
