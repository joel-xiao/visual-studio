import type { AgentRole } from '../../types';
import type { IAgentSchema } from '../types';
import { getDataTemplate } from './template';
import { createRoutingPrompt } from '../../utils/agent/routing';

/**
 * Data Analyst Agent Schema
 * 数据分析师 Agent 定义
 */
const dataAnalystSchema: IAgentSchema = {
  id: 'data-analyst',
  role: 'data-analyst' as AgentRole,
  name: 'Data Analyst',
  displayName: '数据分析师',
  description: 'Responsible for data analysis and mock data generation.',
  icon: 'mdi:table-large',
  color: '#2ecc71',

  routing: {
    hints: ['数据', 'mock', '分析', '填充数据'],
    tags: ['数据分析', 'Mock生成', '数据预测', '指标计算', '数据清洗'],
    intent: '负责理解业务数据需求，生成符合逻辑的模拟数据，以及进行数据层面的深度分析',
    priorityRules: {
      withSelection: '如果用户要求为选中的图表生成或修改数据，请路由给 data-analyst',
      withoutSelection: '如果用户要求生成数据或进行数据分析，路由给 data-analyst'
    },
    routingPrompt: (() => '') as (agentList: string, context: any) => string
  },

  prompts: {
    generate: (layoutContext: string) => `你是一位数据分析师 (Data Analyst)。请为图表生成 Mock 数据。
请只返回合法的 JSON:
${getDataTemplate()}
${layoutContext}`
  },

  // 流式输出消息
  messages: {
    processing: '正在分析数据...',
    completed: '已完成数据分析'
  }
};

dataAnalystSchema.routing.routingPrompt = createRoutingPrompt(dataAnalystSchema);

export default dataAnalystSchema;
