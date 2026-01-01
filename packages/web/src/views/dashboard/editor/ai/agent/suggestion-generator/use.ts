import type { IAgent, IAgentResponse } from '../../types';
import suggestionGeneratorSchema from './schema';
import { useBaseAgent } from '../../utils/agent/base-agent';

// 动态获取所有 agent schemas
const agentSchemaModules = import.meta.glob<{ default: any }>('../*/schema.ts', { eager: true });
const workflowModules = import.meta.glob<{ [key: string]: any }>('../../workflow/workflows/*.ts', { eager: true });

export function useSuggestionGenerator(): IAgent {
  const schema = suggestionGeneratorSchema;
  const { processWithAI } = useBaseAgent(schema);

  const process = async (input: string, context?: any, onStream?: any): Promise<IAgentResponse> => {
    const nodes = context?.nodes || [];
    const selectedNodes = context?.selectedNodes || [];
    const availableComponents = context?.availableComponents || [];

    const contextInfo = buildContextInfo(nodes, selectedNodes, availableComponents);
    const agentInfo = getAvailableAgents();
    const workflowInfo = getAvailableWorkflows();

    const fullContext = `${contextInfo}\n\n### 可用 Agents：\n${agentInfo}\n\n### 可用工作流：\n${workflowInfo}`;

    return processWithAI(schema.prompts.generate(fullContext), input, onStream, (json) => {
      if (!json.suggestions || !Array.isArray(json.suggestions)) {
        throw new Error('返回建议数据格式错误');
      }
      return { data: json };
    });
  };

  return { 
    role: schema.role as any, 
    name: schema.name, 
    description: schema.description, 
    process 
  };
}

function getAvailableAgents(): string {
  const agents: string[] = [];
  
  Object.entries(agentSchemaModules).forEach(([, module]) => {
    if (module.default) {
      const schema = module.default;
      agents.push(`- ${schema.role}: ${schema.displayName} - ${schema.description}`);
    }
  });

  return agents.join('\n');
}

function getAvailableWorkflows(): string {
  const workflows: string[] = [];
  
  Object.entries(workflowModules).forEach(([path, module]) => {
    const workflowName = path.split('/').pop()?.replace('.ts', '') || '';
    if (workflowName === 'index') return;
    
    // 查找 create 函数
    const createFnName = Object.keys(module).find(
      key => key.startsWith('create') && key.endsWith('Workflow') && typeof module[key] === 'function'
    );
    
    if (createFnName) {
      try {
        const workflow = module[createFnName]();
        workflows.push(`- ${workflow.id}: ${workflow.name} - ${workflow.description}`);
      } catch (e) {
        workflows.push(`- ${workflowName}: 工作流 (详情获取失败)`);
      }
    }
  });

  return workflows.join('\n');
}

function buildContextInfo(nodes: any[], selectedNodes: any[], availableComponents: any[]): string {
  const nodeCount = nodes.filter(n => n.id !== 'root').length;
  const hasSelection = selectedNodes.length > 0 && selectedNodes[0].id !== 'root';
  
  let contextInfo = `画布状态：${nodeCount === 0 ? '空画布' : `包含${nodeCount}个组件`}\n`;
  
  if (hasSelection) {
    const selected = selectedNodes[0];
    contextInfo += `当前选中：${selected.name || '未命名组件'} (类型: ${selected.component || selected.schema})\n`;
    
    if (selected.component?.includes('APACHE_ECHARTS')) {
      contextInfo += `选中组件是图表类型，支持图表相关操作\n`;
    }
  } else {
    contextInfo += `当前无选中组件\n`;
  }

  if (nodeCount > 0) {
    const componentTypes = nodes
      .filter(n => n.id !== 'root')
      .map(n => n.component || n.schema)
      .filter(Boolean);
    contextInfo += `现有组件类型：${[...new Set(componentTypes)].join(', ')}\n`;
  }

  contextInfo += `可用组件：${availableComponents.map(c => c.name).join(', ')}\n`;

  return contextInfo;
}