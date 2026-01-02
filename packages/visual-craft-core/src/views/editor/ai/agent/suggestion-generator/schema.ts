import type { AgentRole } from '../../types';
import type { IAgentSchema } from '../types';

// 动态获取所有 agent schemas
const agentSchemaModules = import.meta.glob<{ default: any }>('../*/schema.ts', { eager: true });
const workflowModules = import.meta.glob<{ [key: string]: any }>('../../workflow/workflows/*.ts', { eager: true });

// 获取可用 Agents 信息
function getAvailableAgentsInfo(): string {
  const agents: string[] = [];

  Object.entries(agentSchemaModules).forEach(([path, module]) => {
    if (module.default && !path.includes('suggestion-generator')) { // 排除自己
      const schema = module.default;
      agents.push(`- ${schema.role}: ${schema.displayName} - ${schema.description}`);
    }
  });

  return agents.join('\n');
}

// 获取可用工作流信息
function getAvailableWorkflowsInfo(): string {
  const workflows: string[] = [];

  Object.entries(workflowModules).forEach(([path, module]) => {
    const workflowName = path.split('/').pop()?.replace('.ts', '') || '';
    if (workflowName === 'index') return;

    const createFnName = Object.keys(module).find(
      key => key.startsWith('create') && key.endsWith('Workflow') && typeof module[key] === 'function'
    );

    if (createFnName) {
      try {
        const workflow = module[createFnName]();
        workflows.push(`- ${workflow.id}: ${workflow.name} - ${workflow.description}`);
      } catch (e) {
        workflows.push(`- ${workflowName}: 工作流`);
      }
    }
  });

  return workflows.join('\n');
}

const suggestionGeneratorSchema: IAgentSchema = {
  id: 'suggestion-generator',
  role: 'suggestion-generator' as AgentRole,
  name: 'Suggestion Generator',
  displayName: '建议生成器',
  description: 'Generate contextual suggestions based on current canvas state and user context.',
  icon: 'mdi:lightbulb-outline',
  color: '#67c23a',

  routing: {
    hints: [],
    tags: [],
    intent: '根据当前画布状态生成上下文相关的建议',
    priorityRules: {},
    routingPrompt: () => ''
  },

  uiHints: {
    fullWidth: false,
    primaryActionText: '应用建议'
  },

  prompts: {
    generate: (context: string) => `你是一个智能建议生成器，根据当前大屏编辑器的状态生成相关的操作建议。

### 当前上下文：
${context}

### 可用智能体：
${getAvailableAgentsInfo()}

### 可用工作流：
${getAvailableWorkflowsInfo()}

### 建议参考格式（参考 presets.ts 中的建议样式）：
- 空画布：生成销售大屏、添加柱状图、切换暗黑主题等
- 有内容无选中：优化布局、添加新图表、分析数据等
- 选中图表：换成折线图、变成红色、增加标题、生成模拟数据等
- 选中组件：向左移动、放大一点、复制组件等

### 重要约束：
1. **Agent 限制**：建议的 agent 字段只能使用上面"可用智能体"列表中的 role 名称
2. **图标格式**：必须使用 mdi: 格式，如 "mdi:chart-line"
3. **颜色规范**：只使用：blue, green, purple, orange, pink, cyan
4. **具体可操作**：建议要具体、可操作，参考 presets.ts 中的建议风格

### 输出格式：
{
  "suggestions": [
    {
      "label": "建议显示文本",
      "value": "具体的指令文本",
      "icon": "mdi:图标名称",
      "agent": "智能体role名称",
      "color": "颜色"
    }
  ]
}

请严格按照可用智能体生成4-6个高质量建议，参考 presets.ts 的建议风格。`
  },

  messages: {
    processing: '正在生成建议...',
    applying: '正在应用建议...',
    completed: '建议已生成'
  }
};

export default suggestionGeneratorSchema;
