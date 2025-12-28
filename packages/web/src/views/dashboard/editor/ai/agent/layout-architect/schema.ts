import type { AgentRole } from '../../types';
import type { IAgentSchema } from '../types';
import { getLayoutTemplate } from './template';
import { createRoutingPrompt } from '../../utils/agent/routing';

/**
 * Layout Architect Agent Schema
 * 布局架构师 Agent 定义
 */
const layoutArchitectSchema: IAgentSchema = {
  id: 'layout-architect',
  role: 'layout-architect' as AgentRole,
  name: 'Layout Architect',
  displayName: '布局架构师',
  description: 'Responsible for overall layout structure, visual rhythm, and module partitioning.',
  icon: 'mdi:view-dashboard-outline',
  color: '#f39c12',

  routing: {
    keywords: ['布局', '排版', '大屏', '生成', '创建', '新建', '网格', '位置', '调整大小'],
    priorityRules: {
      withSelection: '如果用户要求移动位置/调整大小，请路由给 layout-architect',
      withoutSelection: '如果用户要求生成新大屏/图表，路由给 layout-architect'
    },
    routingPrompt: (() => '') as (agentList: string, context: any) => string
  },

  prompts: {
    generate: (componentList: string, historyStr: string) => `你是一位大屏布局架构师 (Layout Architect)。请生成一个大屏页面的布局 JSON 数据。
重要要求：
1. 请默认生成一个内容丰富、专业的布局，包含 **5 到 7 个不同的图表组件**。
2. 必须且只能从以下可用组件列表中选择 'component' 和 'schema'：
${componentList}
3. 请使用 grid 布局思想排列组件 (设置合理的 x, y, width, height)，确保布局美观、整齐。
4. 只返回合法的 JSON 格式 (不要使用 markdown 代码块)。

参考模板结构 (请根据需要重复 node 结构以生成多个图表):
${getLayoutTemplate('CANVAS_ROOT', '图表标题', 'APACHE_ECHARTS_BAR_SIMPLE')}
${historyStr}`
  },

  // 流式输出消息
  messages: {
    processing: '正在规划布局...',
    applying: '已生成布局，正在应用...',
    completed: '已生成布局'
  }
};

layoutArchitectSchema.routing.routingPrompt = createRoutingPrompt(layoutArchitectSchema);

export default layoutArchitectSchema;
