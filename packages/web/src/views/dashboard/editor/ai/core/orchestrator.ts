import { IAgent, IAgentResponse, AgentRole } from './types';
import { generateText } from 'ai';
import { defaultModel } from './config';
import { useChartCreator } from '../hooks/agents/use-chart-creator';
import { useLayoutArchitect } from '../hooks/agents/use-layout-architect';
import { useDataAnalyst } from '../hooks/agents/use-data-analyst';
import { useThemeEngine } from '../hooks/agents/use-theme-engine';
import { extractJSON } from './json-utils';

export class AgentOrchestrator {
  private agents: Map<AgentRole, IAgent>;
  private history: any[] = []; // Conversation history context

  constructor() {
    this.agents = new Map();
    // 使用 hooks 创建 agents
    this.agents.set('layout-architect', useLayoutArchitect());
    this.agents.set('chart-creator', useChartCreator());
    this.agents.set('data-analyst', useDataAnalyst());
    this.agents.set('theme-engine', useThemeEngine());
  }

  /**
   * Determine which agent should handle the user input using Vercel AI SDK.
   */
  private async route(input: string, context?: any): Promise<{ role: AgentRole; refinedInput: string }> {
    try {
      const history = context?.history || [];
      const historyStr = history.slice(-5).map((h: any) => `${h.role}: ${h.content}`).join('\n');
      const selectedNodes = context?.selectedNodes || [];

      // Context-aware System Prompt
      let systemPrompt = `你是 AI 大屏设计团队的指挥官 (Orchestrator)。
请根据用户的需求，将任务分发给最合适的专家 Agent。

### 专家团队:
- **layout-architect**: 负责创建新布局、添加组件、调整网格。 (当没有选中组件，或用户明确提到布局/排版/生成大屏时使用)。
- **chart-creator**: 负责修改现有图表 (颜色、类型、数据、标题)。 (当选中了组件，或用户提到图表优化时使用)。
- **data-analyst**: 负责解读数据、生成 Mock 数据。
- **theme-engine**: 负责全局主题切换 (如 "切换到暗黑模式")。 **不要**用于单个图表的颜色修改。

### 当前上下文:
`;

      if (selectedNodes.length > 0) {
        systemPrompt += `\n**当前选中组件**: ${selectedNodes[0].name} (ID: ${selectedNodes[0].id}).
**优先级规则**: 如果用户要求修改该组件的样式/颜色/类型，请路由给 'chart-creator'。只有在移动位置/调整大小时才路由给 'layout-architect'。`;
      } else {
        systemPrompt += `\n**未选中组件** (全局模式)。
**优先级规则**: 如果用户要求生成新大屏/图表，路由给 'layout-architect'。如果要求全局主题，路由给 'theme-engine'。`;
      }

      systemPrompt += `\n\n请返回唯一的 JSON 格式决策 (不要解释):
{"agent": "layout-architect|chart-creator|data-analyst|theme-engine", "refinedInput": "提炼后的用户指令"}

对话历史:
${historyStr}`;

      const { text } = await generateText({
        model: defaultModel,
        system: systemPrompt,
        prompt: input
      });

      // Parse JSON from response
      const parsed = extractJSON(text);
      if (parsed && parsed.agent) {
        return {
          role: parsed.agent as AgentRole,
          refinedInput: parsed.refinedInput || input
        };
      }

      throw new Error('No valid JSON found in response');
    } catch (e) {
      console.warn('[Orchestrator] Routing failed, falling back to rule-based:', e);
      // Fallback logic
      const fallbackInput = input.toLowerCase();
      if (fallbackInput.includes('布局') || fallbackInput.includes('排版') || fallbackInput.includes('大屏') || fallbackInput.includes('生成')) return { role: 'layout-architect', refinedInput: input };
      if (fallbackInput.includes('图表') || fallbackInput.includes('折线') || fallbackInput.includes('颜色') || fallbackInput.includes('柱')) return { role: 'chart-creator', refinedInput: input };
      if (fallbackInput.includes('数据')) return { role: 'data-analyst', refinedInput: input };
      if (fallbackInput.includes('主题')) return { role: 'theme-engine', refinedInput: input };
      return { role: 'layout-architect', refinedInput: input };
    }
  }

  async process(input: string, context?: any, onStream?: (partial: Partial<IAgentResponse>) => void): Promise<IAgentResponse> {
    // Add user input to history
    this.history.push({ role: 'user', content: input });

    const { role: targetRole, refinedInput } = await this.route(input, { ...context, history: this.history });
    const agent = this.agents.get(targetRole);

    if (!agent) {
      throw new Error(`No agent found for role: ${targetRole}`);
    }

    // Merge history into context
    const enrichedContext = {
      ...context,
      history: this.history
    };

    // Agent processing with streaming
    const wrappedOnStream = onStream ? (partial: Partial<IAgentResponse>) => {
      onStream({
        ...partial,
        nextAgent: targetRole // Pass the current agent's role so the UI can show the correct avatar
      });
    } : undefined;

    // Simulate Agent Thought Process (User feedback)
    if (onStream) {
      onStream({
        content: `正在思考... (由 ${agent.name} 接管)`,
        type: 'agent-thought',
        nextAgent: targetRole
      });
    }

    let response = await agent.process(refinedInput, enrichedContext, wrappedOnStream);
    let currentAgentRole = targetRole;

    // Accumulate data from all agents in the chain
    let accumulatedData = { ...response.data };

    // --- Agent Pipeline: Auto-trigger subsequent agents ---
    // When an agent returns nextAgent, automatically continue the chain
    while (response.nextAgent && response.nextAgent !== currentAgentRole) {
      const nextAgent = this.agents.get(response.nextAgent);
      if (!nextAgent) {
        console.warn(`[Orchestrator] Next agent not found: ${response.nextAgent}`);
        break;
      }

      // Show transition message
      if (onStream) {
        onStream({
          content: `任务交接中... (由 ${nextAgent.name} 继续处理)`,
          type: 'agent-thought',
          nextAgent: response.nextAgent
        });
      }

      // Use handoffPrompt if provided, otherwise use the refined input
      const nextInput = response.handoffPrompt || refinedInput;

      // Pass accumulated data as context
      const chainedContext = {
        ...enrichedContext,
        previousAgentData: accumulatedData,
        previousAgentRole: currentAgentRole
      };

      currentAgentRole = response.nextAgent;
      response = await nextAgent.process(nextInput, chainedContext, wrappedOnStream);

      // Merge new data into accumulated data
      accumulatedData = { ...accumulatedData, ...response.data };
    }

    // Add assistant response to history
    this.history.push({ role: 'assistant', content: JSON.stringify(response) });

    return {
      ...response,
      data: accumulatedData, // Return the merged data
      nextAgent: currentAgentRole
    };
  }

  getAgent(role: AgentRole) {
    return this.agents.get(role);
  }
}
