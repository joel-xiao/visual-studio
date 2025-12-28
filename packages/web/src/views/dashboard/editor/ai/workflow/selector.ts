import { generateText } from 'ai';
import { useAIConfig } from '../hooks/core/use-ai-config';
import { extractJSON } from '../utils/json-utils';
import type { IWorkflowGraph } from './core/types';
import type { AgentRole } from '../types';
import { getAgentInfo, matchAgentByRules } from '../agent/registry';
import { WorkflowRegistry } from './registry';

export class WorkflowSelector {
  private getDefaultModel() {
    const config = useAIConfig();
    return config.defaultModel;
  }

  async selectWorkflow(input: string, context: unknown): Promise<IWorkflowGraph | null> {
    try {
      const contextObj = context && typeof context === 'object' ? context as Record<string, unknown> : {};
      const historySlice = Array.isArray(contextObj.history) ? contextObj.history : [];
      const historyStr = historySlice.slice(-5).map((h: { role?: string; content?: string }) => `${h.role || 'unknown'}: ${h.content || ''}`).join('\n');
      const selectedNodes = Array.isArray(contextObj.selectedNodes) ? contextObj.selectedNodes : [];
      const nodes = Array.isArray(contextObj.nodes) ? contextObj.nodes : [];

      const agentInfo = getAgentInfo();
      const agentList = agentInfo.map(agent =>
        `- **${agent.role}**: ${agent.displayName} - ${agent.description}`
      ).join('\n');

      const workflowIds = WorkflowRegistry.getAllIds();
      const workflowList = workflowIds.map(id => `- **${id}**: ${this.getWorkflowDescription(id)}`).join('\n');

      const firstSelectedNode = selectedNodes.length > 0 ? selectedNodes[0] as { name?: string } : null;

      const systemPrompt = `你是 AI 大屏设计工作流选择器。
根据用户需求，选择最合适的工作流。

### 可用工作流:
${workflowList}

### 可用 Agents:
${agentList}

### 当前上下文:
${firstSelectedNode ? `**选中组件**: ${firstSelectedNode.name || 'Unknown'}` : '**未选中组件**'}
**画布节点数**: ${nodes.length}

请返回 JSON 格式:
{"workflow": "${workflowIds.join('|')}", "agent": "layout-architect|chart-creator|data-analyst|theme-engine"}

对话历史:
${historyStr}`;

      const { text } = await generateText({
        model: this.getDefaultModel(),
        system: systemPrompt,
        prompt: input
      });

      const parsed = extractJSON(text);
      if (parsed && parsed.workflow) {
        return this.createWorkflow(parsed.workflow, parsed.agent);
      }
    } catch (e) {
      console.warn('[WorkflowSelector] AI selection failed, using rule-based:', e);
    }

    const contextObj = context && typeof context === 'object' ? context as Record<string, unknown> : {};
    return this.selectWorkflowByRules(input, contextObj);
  }

  private selectWorkflowByRules(input: string, context: Record<string, unknown>): IWorkflowGraph {
    const lowerInput = input.toLowerCase();
    const matchedWorkflows: Array<{ workflow: IWorkflowGraph; priority: number }> = [];
    const workflowIds = WorkflowRegistry.getAllIds();

    for (const workflowId of workflowIds) {
      const workflow = WorkflowRegistry.get(workflowId);
      if (!workflow || !workflow.matchRule) continue;

      const rule = workflow.matchRule;
      let matched = false;

      if (rule.keywords && rule.keywords.length > 0) {
        matched = rule.keywords.some(keyword => lowerInput.includes(keyword.toLowerCase()));
      }

      if (!matched && rule.match) {
        matched = rule.match(input, context);
      }

      if (matched) {
        matchedWorkflows.push({
          workflow,
          priority: rule.priority || 0
        });
      }
    }

    if (matchedWorkflows.length > 0) {
      matchedWorkflows.sort((a, b) => b.priority - a.priority);
      return matchedWorkflows[0].workflow;
    }

    const matchedRole = matchAgentByRules(input);
    if (matchedRole) {
      return WorkflowRegistry.createSimpleAgent(matchedRole);
    }

    return WorkflowRegistry.createSimpleAgent('layout-architect');
  }

  private getWorkflowDescription(workflowId: string): string {
    const workflow = WorkflowRegistry.get(workflowId);
    if (workflow) {
      return workflow.description || workflow.name || workflowId;
    }
    return workflowId;
  }

  private createWorkflow(workflowName: string, agent?: string): IWorkflowGraph | null {
    const workflow = WorkflowRegistry.get(workflowName, agent);
    if (workflow) {
      return workflow;
    }

    if (workflowName === 'simple-agent') {
      const agentRole = (agent as AgentRole) || 'layout-architect';
      return WorkflowRegistry.createSimpleAgent(agentRole);
    }

    return null;
  }
}
