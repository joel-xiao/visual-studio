import type { JsonValue } from '../../../../../@types/utils';
import type { AgentContext, IAgent, IAgentResponse } from '../../types';
import suggestionGeneratorSchema from './schema';
import { useBaseAgent } from '../../utils/agent/base-agent';
import { asRecord, pickString } from '../../utils/json-utils';
import type { IAgentSchema } from '../types';
import type { IWorkflowGraph } from '../../workflow/core/types';

// 动态获取所有 agent schemas
const agentSchemaModules = import.meta.glob<{ default: IAgentSchema }>('../*/schema.ts', { eager: true });
const workflowModules = import.meta.glob<Record<string, (...args: string[]) => IWorkflowGraph>>(
  '../../workflow/workflows/*.ts',
  { eager: true }
);

export function useSuggestionGenerator(): IAgent {
  const schema = suggestionGeneratorSchema;
  const { processWithAI } = useBaseAgent(schema);

  const process = async (
    input: string,
    context?: AgentContext,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    const ctx = asRecord(context) ?? {};
    const nodes = Array.isArray(ctx.nodes) ? ctx.nodes : [];
    const selectedNodes = Array.isArray(ctx.selectedNodes) ? ctx.selectedNodes : [];
    const availableComponents = Array.isArray(ctx.availableComponents) ? ctx.availableComponents : [];

    const contextInfo = buildContextInfo(nodes, selectedNodes, availableComponents);
    const agentInfo = getAvailableAgents();
    const workflowInfo = getAvailableWorkflows();

    const fullContext = `${contextInfo}\n\n### 可用 Agents：\n${agentInfo}\n\n### 可用工作流：\n${workflowInfo}`;

    return processWithAI(schema.prompts.generate(fullContext), input, onStream, (json) => {
      const obj = asRecord(json) ?? {};
      if (!Array.isArray(obj.suggestions)) {
        throw new Error('返回建议数据格式错误');
      }
      return { data: obj };
    }, Array.isArray(ctx.attachments) ? (ctx.attachments as { url: string; kind?: string }[]) : undefined);
  };

  return {
    role: schema.role,
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
      } catch {
        workflows.push(`- ${workflowName}: 工作流 (详情获取失败)`);
      }
    }
  });

  return workflows.join('\n');
}

function buildContextInfo(nodes: JsonValue[], selectedNodes: JsonValue[], availableComponents: JsonValue[]): string {
  const nodeCount = nodes.filter(n => pickString(asRecord(n), 'id') !== 'root').length;
  const hasSelection = selectedNodes.length > 0 && pickString(asRecord(selectedNodes[0]), 'id') !== 'root';

  let contextInfo = `画布状态：${nodeCount === 0 ? '空画布' : `包含${nodeCount}个组件`}\n`;

  if (hasSelection) {
    const selected = asRecord(selectedNodes[0]) ?? {};
    const selectedName = pickString(selected, 'name') || '未命名组件';
    const selectedComponent = pickString(selected, 'component') || pickString(selected, 'schema') || '';
    contextInfo += `当前选中：${selectedName} (类型: ${selectedComponent})\n`;

    if (selectedComponent.includes('APACHE_ECHARTS')) {
      contextInfo += `选中组件是图表类型，支持图表相关操作\n`;
    }
  } else {
    contextInfo += `当前无选中组件\n`;
  }

  if (nodeCount > 0) {
    const componentTypes = nodes
      .filter(n => pickString(asRecord(n), 'id') !== 'root')
      .map(n => pickString(asRecord(n), 'component') || pickString(asRecord(n), 'schema') || '')
      .filter(Boolean);
    contextInfo += `现有组件类型：${[...new Set(componentTypes)].join(', ')}\n`;
  }

  const componentNames = availableComponents
    .map(c => pickString(asRecord(c), 'name') || '')
    .filter(Boolean);
  contextInfo += `可用组件：${componentNames.join(', ')}\n`;

  return contextInfo;
}
