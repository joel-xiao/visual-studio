import { ref, unref, type Ref } from 'vue';
import type { IAgentResponse, IChatImageAttachment, AgentRole } from '../../types';
import { WorkflowEngine } from '../../workflow/core/engine';
import { WorkflowSelector } from '../../workflow/selector';
import { applyAgentData, getAgentSchema } from '../../agent/registry';
import { useAIContext } from '../core/use-ai-context';

export interface IHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  attachments?: IChatImageAttachment[];
}

export function useOrchestrator() {
  const aiContext = useAIContext();
  const history = ref<IHistoryItem[]>([]);
  const selector = new WorkflowSelector();
  const resolveApplyStrategy = (agent?: AgentRole, nodeConfig?: Record<string, any>): 'manual' | 'auto' => {
    const fromNode = nodeConfig?.uiHints?.applyStrategy ?? nodeConfig?.applyStrategy;
    if (fromNode === 'auto' || fromNode === 'manual') return fromNode;
    if (!agent) return 'manual';
    const schema = getAgentSchema(agent);
    const fromSchema = schema?.uiHints?.applyStrategy;
    if (fromSchema === 'auto' || fromSchema === 'manual') return fromSchema;
    return 'manual';
  };

  const process = async (
    input: string,
    options: {
      attachments?: IChatImageAttachment[];
      onStream?: (partial: Partial<IAgentResponse>) => void;
    } = {}
  ): Promise<IAgentResponse> => {
    const attachments = options.attachments || [];
    const onStream = options.onStream;

    history.value.push({ role: 'user', content: input, attachments });
    const context = {
      input,
      attachments,
      nodes: unref(aiContext.nodeContext.getNodes()),
      selectedNodes: unref(aiContext.nodeContext.getSelectedNodes()),
      availableComponents: aiContext.componentContext.getAvailableComponents(),
      history: history.value.map(h => ({ role: h.role, content: h.content, attachments: h.attachments || [] }))
    };

    try {
      const workflow = await selector.selectWorkflow(input, context);
      if (!workflow) throw new Error('未能识别您的意图，请尝试换种说法');

      const engine = new WorkflowEngine(workflow);
      const agentNodes = workflow.nodes.filter(n => n.type === 'agent');
      const isMultiStep = agentNodes.length > 1;
      const shouldAutoApplyAll = agentNodes.length > 0 && agentNodes.every(n => resolveApplyStrategy(n.agent, n.config) === 'auto');
      const result = await engine.execute(input, context,
        (nodeId, partial) => {
          const node = workflow.nodes.find(n => n.id === nodeId);
          onStream?.({ ...partial, agent: node?.agent });
        },
        (nodeId, nodeRes) => {
          const node = workflow.nodes.find(n => n.id === nodeId);
          if (!nodeRes.data || !node?.agent) return;
          if (!isMultiStep || shouldAutoApplyAll) {
            applyAgentData(node.agent, aiContext, nodeRes.data);
          }
        }
      );

      const finalResponse = engine.getFinalResponse(result.success, result.error);
      history.value.push({ role: 'assistant', content: finalResponse.content });
      return finalResponse;

    } catch (e: any) {
      console.error('[Orchestrator] Task failed:', e);
      return { content: e.message || '执行出错', type: 'text', isError: true };
    }
  };

  return { process, history, clearHistory: () => (history.value = []) };
}
