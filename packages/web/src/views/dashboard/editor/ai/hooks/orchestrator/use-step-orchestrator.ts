import { ref, unref, type Ref } from 'vue';
import type { IAgentResponse, AgentRole } from '../../types';
import { StepWorkflowEngine } from '../../workflow/core/step-engine';
import { WorkflowSelector } from '../../workflow/selector';
import { applyAgentData } from '../../agent/registry';
import { useAIContext } from '../core/use-ai-context';

export interface IHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface IStepExecutionState {
  engine: StepWorkflowEngine | null;
  currentStep: number;
  totalSteps: number;
  isWaitingForConfirmation: boolean;
  lastResponse: IAgentResponse | null;
}

export function useStepOrchestrator() {
  const aiContext = useAIContext();
  const history = ref<IHistoryItem[]>([]);
  const selector = new WorkflowSelector();
  const executionState = ref<IStepExecutionState>({
    engine: null,
    currentStep: 0,
    totalSteps: 0,
    isWaitingForConfirmation: false,
    lastResponse: null
  });

  const process = async (
    input: string,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    history.value.push({ role: 'user', content: input });
    const context = {
      input,
      nodes: unref(aiContext.nodeContext.getNodes()),
      selectedNodes: unref(aiContext.nodeContext.getSelectedNodes()),
      availableComponents: aiContext.componentContext.getAvailableComponents(),
      history: history.value.map(h => ({ role: h.role, content: h.content }))
    };

    try {
      const workflow = await selector.selectWorkflow(input, context);
      if (!workflow) throw new Error('未能识别您的意图，请尝试换种说法');

      const isMultiStep = workflow.nodes.filter(n => n.type === 'agent').length > 1;
      
      if (!isMultiStep) {
        const { WorkflowEngine } = await import('../../workflow/core/engine');
        const engine = new WorkflowEngine(workflow);
        const result = await engine.execute(input, context,
          (nodeId, partial) => {
            const node = workflow.nodes.find(n => n.id === nodeId);
            onStream?.({ ...partial, agent: node?.agent });
          },
          (nodeId, nodeRes) => {
            const node = workflow.nodes.find(n => n.id === nodeId);
            if (nodeRes.data && node?.agent) {
              applyAgentData(node.agent, aiContext, nodeRes.data);
            }
          }
        );
        const finalResponse = engine.getFinalResponse(result.success, result.error);
        history.value.push({ role: 'assistant', content: finalResponse.content });
        return finalResponse;
      }

      const engine = new StepWorkflowEngine(workflow);
      executionState.value.engine = engine;
      executionState.value.totalSteps = workflow.nodes.filter(n => n.type === 'agent').length;
      executionState.value.currentStep = 1;

      const stepResult = await engine.executeStep(input, context, (nodeId, partial) => {
        const node = workflow.nodes.find(n => n.id === nodeId);
        onStream?.({ ...partial, agent: node?.agent });
      });

      if (stepResult.response) {
        executionState.value.lastResponse = stepResult.response;
        executionState.value.isWaitingForConfirmation = stepResult.hasNext;
        
        const enhancedResponse: IAgentResponse = {
          ...stepResult.response,
          workflowControl: {
            isMultiStep: true,
            currentStep: executionState.value.currentStep,
            totalSteps: executionState.value.totalSteps,
            hasNext: stepResult.hasNext,
            nextNodeId: stepResult.nextNodeId
          }
        };

        history.value.push({ role: 'assistant', content: enhancedResponse.content });
        return enhancedResponse;
      }

      // 工作流完成但没有响应（可能只有控制节点）
      if (!stepResult.hasNext) {
        return {
          content: '工作流已完成',
          type: 'text',
          workflowControl: {
            isMultiStep: true,
            currentStep: executionState.value.totalSteps,
            totalSteps: executionState.value.totalSteps,
            hasNext: false
          }
        };
      }

      throw new Error('工作流执行失败');

    } catch (e: any) {
      console.error('[StepOrchestrator] Task failed:', e);
      return { content: e.message || '执行出错', type: 'text', isError: true };
    }
  };

  const applyAndContinue = async (
    data: any,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse | null> => {
    const state = executionState.value;
    if (!state.engine || !state.isWaitingForConfirmation || !state.lastResponse) {
      return null;
    }

    try {
      if (state.lastResponse.agent && data) {
        applyAgentData(state.lastResponse.agent, aiContext, data);
      }

      const context = {
        nodes: unref(aiContext.nodeContext.getNodes()),
        selectedNodes: unref(aiContext.nodeContext.getSelectedNodes()),
        availableComponents: aiContext.componentContext.getAvailableComponents(),
        history: history.value.map(h => ({ role: h.role, content: h.content }))
      };

      const stepResult = await state.engine.continueExecution('', context, (nodeId, partial) => {
        const currentNode = state.engine?.getCurrentNode();
        onStream?.({ ...partial, agent: currentNode?.agent });
      });

      if (stepResult.response) {
        state.currentStep++;
        state.lastResponse = stepResult.response;
        state.isWaitingForConfirmation = stepResult.hasNext;

        const enhancedResponse: IAgentResponse = {
          ...stepResult.response,
          workflowControl: {
            isMultiStep: true,
            currentStep: state.currentStep,
            totalSteps: state.totalSteps,
            hasNext: stepResult.hasNext,
            nextNodeId: stepResult.nextNodeId
          }
        };

        history.value.push({ role: 'assistant', content: enhancedResponse.content });
        return enhancedResponse;
      }

      state.isWaitingForConfirmation = false;
      return null;

    } catch (e: any) {
      console.error('[StepOrchestrator] Continue failed:', e);
      return { content: e.message || '继续执行出错', type: 'text', isError: true };
    }
  };

  const resetExecution = () => {
    executionState.value = {
      engine: null,
      currentStep: 0,
      totalSteps: 0,
      isWaitingForConfirmation: false,
      lastResponse: null
    };
  };

  return { 
    process, 
    applyAndContinue,
    executionState: executionState.value,
    history, 
    clearHistory: () => {
      history.value = [];
      resetExecution();
    }
  };
}