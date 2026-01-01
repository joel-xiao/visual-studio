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
        `- **${agent.role}**: ${agent.displayName} - ${agent.description} (意图: ${(agent as any).intent || '无'})`
      ).join('\n');

      const workflowIds = WorkflowRegistry.getAllIds();
      const workflowList = workflowIds.map(id => `- **${id}**: ${this.getWorkflowDescription(id)}`).join('\n');

      const firstSelectedNode = selectedNodes.length > 0 ? selectedNodes[0] as { name?: string } : null;

      const systemPrompt = `你是 AI 大屏设计工作流引擎。
请根据用户需求，先对指令进行【语义打标】，然后选择最合适的工作流。

### 语义打标指南:
- [标签: 整体设计]: 涉及“大屏”、“页面”、“布局”、“整页”、“新建屏”等全局概念。
- [标签: 组件操作]: 涉及“添加”、“创建”、“生成”某个具体的图表或组件。
- [标签: 样式美化]: 涉及“美化”、“优化”、“好点”、“改样式”、“调颜色”等。
- [标签: 主题切换]: 涉及“换肤”、“改配色”、“暗黑模式”、“明亮模式”等全局风格。
- [标签: 数据填充]: 涉及“填充数据”、“换数据”、“Mock”、“分析数据”等。

### 可用工作流:
${workflowList}

### 可用 Agents (如果无法匹配工作流，则路由给单个 Agent):
${agentList}

### 决策指南:
1. 如果包含 [整体设计]，优先选择 \`layout-to-chart\`。
2. 如果只包含 [组件操作]，优先选择 \`chart-generation\`。
3. 如果只包含 [样式美化] 且有组件选中，优先选择 \`chart-optimization\`。
4. 如果包含 [主题切换]，优先选择 \`theme-to-chart\`。

请返回 JSON 格式:
{"tags": ["标签1", "标签2"], "intent": "意图描述", "workflow": "工作流ID", "agent": "AgentRole"}`;

      const { text } = await generateText({
        model: this.getDefaultModel(),
        system: systemPrompt,
        prompt: `用户指令: ${input}\n\n当前状态: ${firstSelectedNode ? `已选中[${firstSelectedNode.name}]` : '未选中组件'}\n对话历史:\n${historyStr}`
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

    // 简易标签提取逻辑
    const extractedTags: string[] = [];
    if (lowerInput.includes('屏') || lowerInput.includes('页') || lowerInput.includes('布局') || lowerInput.includes('整体')) extractedTags.push('整体设计');
    if (lowerInput.includes('加') || lowerInput.includes('创') || lowerInput.includes('图')) extractedTags.push('组件操作');
    if (lowerInput.includes('美') || lowerInput.includes('优') || lowerInput.includes('调')) extractedTags.push('样式美化');
    if (lowerInput.includes('主题') || lowerInput.includes('色') || lowerInput.includes('换')) extractedTags.push('主题切换');
    if (lowerInput.includes('数据') || lowerInput.includes('mock')) extractedTags.push('数据填充');

    for (const workflowId of workflowIds) {
      const workflow = WorkflowRegistry.get(workflowId);
      if (!workflow || !workflow.matchRule) continue;

      const rule = workflow.matchRule;
      let score = 0;

      // 关键词线索匹配 (作为补充依据)
      if ((rule as any).hints) {
        (rule as any).hints.forEach((hint: string) => {
          if (lowerInput.includes(hint.toLowerCase())) score += 1;
        });
      }

      // 语义标签匹配 (权重更高)
      if ((rule as any).tags) {
        (rule as any).tags.forEach((tag: string) => {
          if (lowerInput.includes(tag.toLowerCase())) score += 2;
        });
      }

      // 自定义逻辑判断
      if (rule.match && rule.match(input, context)) {
        score += 5;
      }

      if (score > 0) {
        matchedWorkflows.push({
          workflow,
          priority: (rule.priority || 0) + score
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
