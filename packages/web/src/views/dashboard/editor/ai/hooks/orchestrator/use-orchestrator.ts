import { ref, unref, type Ref } from 'vue';
import type { IAgentResponse, AgentRole } from '../../types';
import { WorkflowEngine } from '../../workflow/core/engine';
import { WorkflowSelector } from '../../workflow/selector';
import { applyAgentData } from '../../agent/registry';
import { useAIContext } from '../core/use-ai-context';

export interface IHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export function useOrchestrator() {
  const aiContext = useAIContext();
  const history = ref<IHistoryItem[]>([]);
  const selector = new WorkflowSelector();

  const process = async (
    input: string,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    history.value.push({ role: 'user', content: input });
    const context = {
      input,
      nodes: unref(aiContext.nodeContext.getNodes()),
      selectedNodes: unref(aiContext.nodeContext.getSelectedNodes()),
      history: history.value.map(h => ({ role: h.role, content: h.content }))
    };

    try {
      const workflow = await selector.selectWorkflow(input, context);
      if (!workflow) throw new Error('未能识别您的意图，请尝试换种说法');

      const engine = new WorkflowEngine(workflow);
      const result = await engine.execute(input, context,
        (nodeId, partial) => {
          const node = workflow.nodes.find(n => n.id === nodeId);
          onStream?.({ ...partial, agent: node?.agent });
        },
        (nodeId, nodeRes) => {
          const node = workflow.nodes.find(n => n.id === nodeId);
          if (nodeRes.data && node?.agent) applyAgentData(node.agent, aiContext, nodeRes.data);
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
