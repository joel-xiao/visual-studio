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
    const contextObj = context && typeof context === 'object' ? context as Record<string, unknown> : {};

    try {
      const historyStr = this.getHistoryString(contextObj);
      const stateStr = this.getStateString(contextObj);
      const optionsStr = this.getAvailableOptionsString();

      const systemPrompt = `你是一个大屏设计系统的【极速调度中枢】。
任务：分析用户指令，在当前看板状态下，选出最能解决问题的【执行方案】。

### 执行方案库:
${optionsStr}

### 当前上下文 (状态 & 历史):
${stateStr}
${historyStr}

### 决策逻辑:
1. **识别复杂意图**: 如果涉及多步协作（如创建、整体调整、多组件协同），必须选择 [Workflow]。
2. **识别单一意图**: 如果直接指向特定原子功能（如改颜色、换数据、调整单个组件），选择对应的 [Agent]。
3. **环境适应**: 根据看板是否已有节点、是否有选中项来微调决策。

请根据方案库中的 ID、描述、意图以及关联的关键词（Hints/Tags）进行逻辑判断。
直接输出 JSON:
{
  "thought": "你的核心决策逻辑简述",
  "workflow": "选中的 Workflow ID (若无可不填)",
  "agent": "选中的 Agent Role (若无可不填)"
}`;

      const { text } = await generateText({
        model: this.getDefaultModel(),
        system: systemPrompt,
        prompt: `用户输入: "${input}"\n请综合判断并返回 JSON:`
      });

      const parsed = extractJSON(text);
      if (parsed && (parsed.workflow || parsed.agent)) {
        console.log(`[Router] AI-matched: ${parsed.thought}`);
        return this.createWorkflow(parsed.workflow, parsed.agent);
      }
    } catch (e) {
      console.error('[WorkflowSelector] AI router critical error:', e);
    }

    return null;
  }

  private getHistoryString(context: any): string {
    const history = Array.isArray(context.history) ? context.history : [];
    if (history.length === 0) return '';
    return '\n最近对话:\n' + history.slice(-3)
      .map((h: any) => `- ${h.role === 'user' ? '用户' : '助手'}: ${h.content}`)
      .join('\n');
  }

  private getStateString(context: any): string {
    const nodes = Array.isArray(context.nodes) ? context.nodes : [];
    const selected = (Array.isArray(context.selectedNodes) ? context.selectedNodes : [])[0] as any;

    return [
      `- 看板节点数: ${nodes.length}`,
      `- 当前选中: ${selected ? `${selected.name || selected.type}` : '无'}`
    ].join('\n');
  }

  private getAvailableOptionsString(): string {
    const workflows = WorkflowRegistry.getAllIds().map(id => {
      const w = WorkflowRegistry.get(id);
      const keywords = w?.matchRule?.keywords ? ` (Keywords: ${w.matchRule.keywords.join(', ')})` : '';
      return `- [Workflow] ${id}: ${w?.description || w?.name || id}${keywords}`;
    });

    const agents = getAgentInfo()
      .filter(a => a.role !== 'orchestrator')
      .map(a => {
        const keywords = [...(a.hints || []), ...(a.tags || [])];
        const kwStr = keywords.length > 0 ? ` (Hints: ${keywords.join(', ')})` : '';
        return `- [Agent] ${a.role}: ${a.displayName} - ${a.description}${kwStr}`;
      });

    return [...workflows, ...agents].join('\n');
  }

  private createWorkflow(workflowName: string, agent?: string): IWorkflowGraph | null {
    if (workflowName && WorkflowRegistry.has(workflowName)) {
      return WorkflowRegistry.get(workflowName);
    }
    if (agent) {
      return WorkflowRegistry.createSimpleAgent(agent as AgentRole);
    }
    return null;
  }
}
