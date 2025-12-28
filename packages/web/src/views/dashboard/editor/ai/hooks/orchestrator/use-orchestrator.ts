import { ref, unref, type Ref } from 'vue';
import type { IAgentResponse, AgentRole } from '../../types';
import { WorkflowEngine } from '../../workflow/core/engine';
import { WorkflowSelector } from '../../workflow/selector';
import { registerAgents, generateRoutingPrompt, matchAgentByRules } from '../../agent/registry';
import { generateText } from 'ai';
import { useAIConfig } from '../core/use-ai-config';
import { extractJSON } from '../../utils/json-utils';
import { applyAgentData } from '../../agent/registry';
import { useAIContext } from '../core/use-ai-context';

/**
 * 对话历史记录项
 */
export interface IHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

/**
 * Orchestrator 配置选项
 */
export interface IOrchestratorOptions {
  /**
   * 执行模式
   * - 'workflow': 使用工作流图驱动（多步骤任务）
   * - 'simple': 使用自动路由（单 Agent 任务）
   */
  mode?: 'workflow' | 'simple';
}

/**
 * Orchestrator Hook
 * 支持两种模式：工作流模式和自动路由模式
 */
export function useOrchestrator(options: IOrchestratorOptions = {}) {
  const { mode = 'workflow' } = options;
  const { defaultModel } = useAIConfig();
  const aiContext = useAIContext();
  const { nodeContext, componentContext } = aiContext;

  // 对话历史记录（合并自 use-conversation-history）
  const history: Ref<IHistoryItem[]> = ref([]);

  const addHistory = (role: 'user' | 'assistant', content: string) => {
    history.value.push({
      role,
      content,
      timestamp: Date.now()
    });
  };

  const getRecentHistory = (count: number = 5): string => {
    const recent = history.value.slice(-count);
    return recent.map((h) => `${h.role}: ${h.content}`).join('\n');
  };

  const getAllHistory = (): IHistoryItem[] => {
    return [...history.value];
  };

  // 工作流相关
  const selector = mode === 'workflow' ? new WorkflowSelector() : null;
  const agents = mode === 'simple' ? registerAgents() : null;

  /**
   * 自动路由模式：直接路由到 Agent
   */
  const routeToAgent = async (input: string, context?: unknown): Promise<{ role: AgentRole; refinedInput: string }> => {
    if (!agents) throw new Error('Simple mode requires agents');

    try {
      const contextObj = context && typeof context === 'object' ? context as Record<string, unknown> : {};
      const historySlice = contextObj.history || getAllHistory();
      const historyStr = getRecentHistory(5);

      const systemPrompt = generateRoutingPrompt({ ...contextObj, history: historySlice });
      const promptWithHistory = `${input}\n\n对话历史:\n${historyStr}`;

      const { text } = await generateText({
        model: defaultModel,
        system: systemPrompt,
        prompt: promptWithHistory
      });

      const parsed = extractJSON(text);
      if (parsed && parsed.agent) {
        return {
          role: parsed.agent as AgentRole,
          refinedInput: parsed.refinedInput || input
        };
      }

      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.warn('[Orchestrator] AI routing failed, falling back to rule-based:', error);
      const matchedRole = matchAgentByRules(input);
      if (matchedRole) {
        return { role: matchedRole, refinedInput: input };
      }
      return { role: 'layout-architect', refinedInput: input };
    }
  };

  /**
   * 自动路由模式的处理
   */
  const processSimple = async (
    input: string,
    context?: unknown,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    if (!agents) throw new Error('Simple mode requires agents');

    addHistory('user', input);

    // 构建上下文（从 AI Context 获取）
    const { getAvailableComponents } = componentContext;
    const contextObj = context && typeof context === 'object' ? context as Record<string, unknown> : {};
    const baseContext = {
      ...contextObj,
      nodes: unref(nodeContext.getNodes()),
      selectedNodes: unref(nodeContext.getSelectedNodes()),
      availableComponents: getAvailableComponents ? getAvailableComponents() : [],
      history: getAllHistory()
    };

    const { role: targetRole, refinedInput } = await routeToAgent(input, baseContext);
    const agent = agents[targetRole];

    if (!agent) {
      throw new Error(`No agent found for role: ${targetRole}`);
    }

    const enrichedContext = {
      ...baseContext,
      history: getAllHistory().map(h => ({ role: h.role, content: h.content }))
    };

    const wrappedOnStream = onStream ? (partial: Partial<IAgentResponse>) => {
      onStream({
        ...partial,
        agent: targetRole
      } as Partial<IAgentResponse> & { agent?: AgentRole });
    } : undefined;

    if (onStream) {
      onStream({
        content: `正在思考... (由 ${agent.name} 接管)`,
        type: 'agent-thought',
        agent: targetRole
      } as Partial<IAgentResponse> & { agent?: AgentRole });
    }

    const response = await agent.process(refinedInput, enrichedContext, wrappedOnStream);
    addHistory('assistant', JSON.stringify(response));

    // 自动应用 agent 数据
    if (response.data && targetRole) {
      applyAgentData(targetRole, aiContext, response.data);
    }

    return response;
  };

  /**
   * 工作流模式的处理
   */
  const processWorkflow = async (
    input: string,
    context?: unknown,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    if (!selector) throw new Error('Workflow mode requires selector');

    addHistory('user', input);

    // 构建上下文（从 AI Context 获取）
    const { getAvailableComponents } = componentContext;
    const contextObj = context && typeof context === 'object' ? context as Record<string, unknown> : {};
    const enrichedContext = {
      ...contextObj,
      nodes: unref(nodeContext.getNodes()),
      selectedNodes: unref(nodeContext.getSelectedNodes()),
      availableComponents: getAvailableComponents ? getAvailableComponents() : [],
      history: getAllHistory().map(h => ({ role: h.role, content: h.content }))
    };

    const workflow = await selector.selectWorkflow(input, enrichedContext);
    if (!workflow) {
      throw new Error('Failed to select workflow');
    }

    const engine = new WorkflowEngine(workflow);

    const wrappedOnStream = onStream ? (nodeId: string, partial: Partial<IAgentResponse>) => {
      const node = workflow.nodes.find(n => n.id === nodeId);
      const agentRole = node?.agent;
      onStream({
        ...partial,
        agent: agentRole
      } as Partial<IAgentResponse> & { agent?: AgentRole });
    } : undefined;

    const result = await engine.execute(input, enrichedContext, wrappedOnStream);
    addHistory('assistant', JSON.stringify(result.finalData));

    const executionContext = engine.getExecutionContext();
    let lastResponse: IAgentResponse | null = null;

    // 应用所有 agent 节点的数据
    if (executionContext) {
      for (const historyItem of executionContext.history) {
        if (historyItem.response?.data) {
          const node = workflow.nodes.find(n => n.id === historyItem.nodeId);
          if (node?.agent) {
            applyAgentData(node.agent, aiContext, historyItem.response.data);
          }
        }
      }

      // 找到最后一个响应
      for (let i = executionContext.history.length - 1; i >= 0; i--) {
        const historyItem = executionContext.history[i];
        if (historyItem.response) {
          lastResponse = historyItem.response;
          break;
        }
      }
    }

    if (!lastResponse) {
      lastResponse = {
        content: result.success ? '工作流执行完成' : `工作流执行失败: ${result.error?.message || '未知错误'}`,
        type: 'text',
        data: result.finalData,
        isError: !result.success
      };
    }

    let finalAgentRole: AgentRole | undefined;
    if (executionContext) {
      for (let i = executionContext.history.length - 1; i >= 0; i--) {
        const historyItem = executionContext.history[i];
        const node = workflow.nodes.find(n => n.id === historyItem.nodeId);
        if (node?.agent) {
          finalAgentRole = node.agent;
          break;
        }
      }
    }

    return {
      ...lastResponse,
      data: result.finalData,
      agent: finalAgentRole
    } as IAgentResponse;
  };

  /**
   * 统一的处理入口
   */
  const process = async (
    input: string,
    context?: unknown,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    if (mode === 'workflow') {
      return processWorkflow(input, context, onStream);
    } else {
      return processSimple(input, context, onStream);
    }
  };

  return {
    process,
    mode,
    getHistory: getAllHistory,
    clearHistory: () => { history.value = []; },
    getAgent: mode === 'simple' && agents ? (role: AgentRole) => agents[role] : undefined
  };
}
