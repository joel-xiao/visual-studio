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
    primaryActionText: '应用到画布',
    secondaryActionText: '更新选中图表'
  },

  prompts: {
    // 场景1: 批量美化图表（来自布局架构师）
    beautify: (chartType: string) => `你是一位专业图表美化师 (Chart Beautifier)。请优化该组件的 ECharts 配置项 (option)。
关注点：视觉美感、清晰的图例、合理的布局。
数据处理原则：
1. 如果输入配置中已有业务数据（dataset 或 series.data），请务必保留原始数据，不要修改它。
2. 如果输入配置中没有数据，则必须生成一段符合图表类型 and 业务场景的 Mock 数据。

请只返回包含 'options' 字段的合法 JSON。
参考模板:
${getChartTemplate(chartType)}

【严格禁令】
1. 严禁设置 'backgroundColor'。图表背景必须保持透明以适配大屏。
2. 不要设置 'color'，除非用户在输入中明确要求了特定颜色。
请必须依赖全局的 ECharts 主题 (Theme) 来自动处理配色逻辑。`,

    // 场景2: 创建新图表
    create: (targetContext?: string) => `你是一位图表设计师 (Chart Creator)。请生成 ECharts 配置项。

请只返回合法的 JSON:
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
  }
};

chartCreatorSchema.routing.routingPrompt = createRoutingPrompt(chartCreatorSchema);

export default chartCreatorSchema;
