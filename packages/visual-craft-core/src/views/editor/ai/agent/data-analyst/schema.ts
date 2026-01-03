import type { AgentContext } from '../../types';
import type { IAgentSchema } from '../types';
import { getDataTemplate } from './template';
import { createRoutingPrompt } from '../../utils/agent/routing';

/**
 * Data Analyst Agent Schema
 * 数据分析师 Agent 定义
 */
const dataAnalystSchema: IAgentSchema = {
  id: 'data-analyst',
  role: 'data-analyst',
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
    routingPrompt: (_agentList: string, _context: AgentContext) => ''
  },

  uiHints: {
    applyStrategy: 'auto'
  },

  prompts: {
    generate: (layoutContext: string) => `你是一位专业的数据分析师 (Data Analyst)。你的任务是为大屏中的图表生成高质量、符合业务逻辑的模拟数据。

### 核心任务：
1. **理解上下文**: 根据提供的图表列表，为每个图表生成合理的 ECharts 配置项（主要针对 series 和 xAxis）。
2. **生成逻辑**: 数据必须符合业务常识（例如：月份应为 1-12，百分比应在 0-100 之间）。
3. **数据洞察**: 提供一段简短且深刻的 'insight'，解释这些数据反映了什么样的业务现状。

### 约束条件：
- **只返回合法的 JSON**: 不要包含任何解释性文字或 Markdown 代码块。
- **ID 匹配**: 'chartDataMap' 中的键 (Key) 必须严格对应下方提供的图表 ID。

### 目标图表上下文：
${layoutContext}

### 期望输出格式参考：
${getDataTemplate()}`
  },

  // 流式输出消息
  messages: {
    processing: '正在分析数据...',
    completed: '已完成数据分析'
  }
};

dataAnalystSchema.routing.routingPrompt = createRoutingPrompt(dataAnalystSchema);

export default dataAnalystSchema;
