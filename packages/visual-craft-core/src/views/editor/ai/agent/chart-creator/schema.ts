import type { AgentRole } from '../../types';
import type { IAgentSchema } from '../types';
import { getChartTemplate } from './template';
import { createRoutingPrompt } from '../../utils/agent/routing';

/**
 * Chart Creator Agent Schema
 * 图表创建器 Agent 定义
 */
const chartCreatorSchema: IAgentSchema = {
  id: 'chart-creator',
  role: 'chart-creator' as AgentRole,
  name: 'Chart Creator',
  displayName: '图表创建器',
  description: 'Responsible for generating and beautifying chart configurations.',
  icon: 'mdi:chart-bar',
  color: '#3498db',

  routing: {
    hints: ['图表', '折线', '柱状', '饼图', '颜色', '样式', '优化图表'],
    tags: ['图表生成', '图表样式', '视觉优化', 'ECharts', '配置项'],
    intent: '创建或修改单个图表的样式、类型和可视化配置',
    priorityRules: {
      withSelection: '如果用户要求修改该组件的样式/颜色/类型，请路由给 chart-creator',
      withoutSelection: '如果用户要求创建新图表或优化现有图表，请路由给 chart-creator'
    },
    routingPrompt: (() => '') as (agentList: string, context: unknown) => string
  },

  uiHints: {
    fullWidth: true,
    primaryActionText: '应用',
    secondaryActionText: '更新'
  },

  prompts: {
    // 场景1: 批量美化图表（来自布局架构师）
    beautify: (chartType: string) => `你是一位专业图表美化师 (Chart Beautifier)。请优化该组件的 ECharts 配置项 (option)。
关注点：视觉美感、清晰的图例、合理的布局。
数据处理原则：
1. 如果输入配置中已有业务数据（dataset 或 series.data），请务必保留原始数据，不要修改它。
2. 如果输入配置中没有数据，则必须生成一段符合图表类型 and 业务场景的 Mock 数据。

图表类型约束（必须严格遵守）：
- 当前图表组件类型: ${chartType}
- 如果组件类型包含 BAR：series.type 必须为 "bar"，严禁输出 "line"/"pie"
- 如果组件类型包含 LINE：series.type 必须为 "line"，严禁输出 "bar"/"pie"
- 如果组件类型包含 PIE：series.type 必须为 "pie"，严禁输出直角坐标系 axis / grid 配置
- 如果你无法判断类型，则不要更改现有 series.type（仅做样式与布局优化）

请只返回包含 'options' 字段的合法 JSON（允许可选包含 component 字段）。
参考模板:
${getChartTemplate(chartType)}

【严格禁令】
1. 严禁设置 'backgroundColor'。图表背景必须保持透明以适配大屏。
请必须依赖全局的 ECharts 主题 (Theme) 来自动处理配色逻辑。`,

    // 场景2: 创建新图表
    create: (targetContext?: string) => `你是一位图表设计师 (Chart Creator)。请生成 ECharts 配置项。

数据处理原则：
1. 必须生成一段符合图表类型与业务场景的 Mock 数据（dataset 或 series.data 均可）。
2. 如果用户明确给了具体数据或业务口径，请以用户输入为准。

图表类型约束（必须严格遵守）：
- 如果用户提供了参考图片：优先识别图片中的图表主类型，只生成该类型（不要混合多种类型）
- 如果用户在文本中明确了类型（柱状/折线/饼图等）：必须严格按该类型生成
- 未明确时：默认柱状图

请只返回合法的 JSON（必须包含 component 与 options）:
${getChartTemplate('APACHE_ECHARTS_BAR_SIMPLE')}

【严格禁令】
1. 严禁设置 'backgroundColor'。图表背景必须保持透明以适配大屏。
2. 不要设置 'color'，除非用户在输入中明确要求了特定颜色。
请必须依赖全局的 ECharts 主题 (Theme) 来自动处理配色逻辑。
${targetContext || ''}`
  },

  // 流式输出消息
  messages: {
    processing: '正在生成图表配置...',
    beautifying: (nodeName: string) => `正在美化图表: ${nodeName}...`,
    beautified: (nodeName: string) => `已优化图表: ${nodeName}`,
    completed: '已完成图表美化',
    created: '已生成图表'
  },

  config: {
    defaults: {
      component: 'APACHE_ECHARTS_BAR_SIMPLE',
      createName: '新图表',
      createPosition: { x: 500, y: 300 }
    }
  }
};

chartCreatorSchema.routing.routingPrompt = createRoutingPrompt(chartCreatorSchema);

export default chartCreatorSchema;
