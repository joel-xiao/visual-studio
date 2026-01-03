import { ref, shallowRef, nextTick } from 'vue';
import type { AgentContext, IAgentResponse, IChatImageAttachment } from '../../types';
import { StepWorkflowEngine } from '../../workflow/core/step-engine';
import type { IWorkflowGraph, IWorkflowNode } from '../../workflow/core/types';
import { WorkflowSelector } from '../../workflow/selector';
import { applyAgentData } from '../../agent/registry';
import { useAIContext } from '../core/use-ai-context';
import { buildChatContext } from './step-orchestrator/context';
import { resolveApplyStrategy, resolveSecondaryAction } from './step-orchestrator/policy';
import { createInitialExecutionState } from './step-orchestrator/state';
import type { IHistoryItem, IStepExecutionState } from './step-orchestrator/types';
import { asRecord, isFunction, pickString } from '../../utils/json-utils';
import type { JsonValue } from '../../../../../@types/utils';

export function useStepOrchestrator() {
  const aiContext = useAIContext();
  const history = ref<IHistoryItem[]>([]);
  const selector = new WorkflowSelector();
  const executionState = shallowRef<IStepExecutionState>(createInitialExecutionState());

  const waitForPaint = () =>
    new Promise<void>((resolve) => {
      const raf = (globalThis as unknown as { requestAnimationFrame?: (cb: () => void) => number }).requestAnimationFrame;
      if (isFunction(raf)) {
        raf(() => resolve());
        return;
      }
      setTimeout(() => resolve(), 0);
    });

  const hasCanvasComponents = (context: Record<string, unknown>) => {
    const nodes = Array.isArray(context.nodes) ? context.nodes : [];
    return nodes.some((n: unknown) => {
      const id = pickString(asRecord(n), 'id');
      return !!id && id !== 'root';
    });
  };

  const createWorkflowEngineHandlers = (params: {
    workflow: IWorkflowGraph;
    context: Record<string, unknown>;
    onStream?: (partial: Partial<IAgentResponse>) => void;
  }) => {
    const { workflow, context, onStream } = params;
    return {
      onStream: (nodeId: string, partial: Partial<IAgentResponse>) => {
        const node = workflow.nodes.find(n => n.id === nodeId);
        onStream?.({ ...partial, agent: node?.agent });
      },
      onNodeComplete: async (nodeId: string, nodeRes: IAgentResponse) => {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (nodeRes.data && node?.agent && resolveApplyStrategy(node.agent, node.config, context) === 'auto') {
          applyAgentData(node.agent, aiContext, nodeRes.data);
          await nextTick();
          await waitForPaint();
        }
      }
    };
  };

  const createStepEngineOptions = (completedAgentsRef: { value: number }, context: Record<string, unknown>) => {
    return {
      shouldStopOnAgent: (node: IWorkflowNode) => resolveApplyStrategy(node.agent, node.config, context) !== 'auto',
      onNodeComplete: async (_nodeId: string, node: IWorkflowNode, nodeRes: IAgentResponse) => {
        completedAgentsRef.value++;
        if (node.agent && resolveApplyStrategy(node.agent, node.config, context) === 'auto' && nodeRes.data) {
          applyAgentData(node.agent, aiContext, nodeRes.data);
          await nextTick();
          await waitForPaint();
        }
      }
    };
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
    const context = buildChatContext({ input, attachments, aiContext, history: history.value });

    try {
      const workflow = await selector.selectWorkflow(input, context);
      if (!workflow) throw new Error('未能识别您的意图，请尝试换种说法');

      const isMultiStep = workflow.nodes.filter(n => n.type === 'agent').length > 1;

      if (!isMultiStep) {
        const { WorkflowEngine } = await import('../../workflow/core/engine');
        const engine = new WorkflowEngine(workflow);
        const handlers = createWorkflowEngineHandlers({ workflow, context, onStream });
        const result = await engine.execute(input, context as unknown as AgentContext, handlers.onStream, handlers.onNodeComplete);
        const finalResponse = engine.getFinalResponse(result.success, result.error);
        history.value.push({ role: 'assistant', content: finalResponse.content });
        return finalResponse;
      }

      const agentNodes = workflow.nodes.filter(n => n.type === 'agent');
      const shouldAutoExecute =
        !hasCanvasComponents(context) &&
        agentNodes.length > 0 &&
        agentNodes.every(n => resolveApplyStrategy(n.agent, n.config, context) === 'auto');

      if (shouldAutoExecute) {
        const { WorkflowEngine } = await import('../../workflow/core/engine');
        const engine = new WorkflowEngine(workflow);
        const handlers = createWorkflowEngineHandlers({ workflow, context, onStream });
        const result = await engine.execute(input, context as unknown as AgentContext, handlers.onStream, handlers.onNodeComplete);

        const response: IAgentResponse = {
          content: result.success ? '工作流已自动执行完成' : `执行失败: ${result.error?.message || '未知错误'}`,
          type: 'text',
          agent: 'orchestrator',
          isError: !result.success
        };
        history.value.push({ role: 'assistant', content: response.content });
        return response;
      }

      const engine = new StepWorkflowEngine(workflow);
      executionState.value.engine = engine;
      executionState.value.totalSteps = agentNodes.length;
      executionState.value.currentStep = 0;
      executionState.value.lastInput = input;
      executionState.value.lastAttachments = attachments;
      executionState.value.workflowId = workflow.id;

      const completedAgents = { value: 0 };
      const stepResult = await engine.executeStep(input, context, (nodeId, partial) => {
        const node = workflow.nodes.find(n => n.id === nodeId);
        onStream?.({ ...partial, agent: node?.agent });
      }, createStepEngineOptions(completedAgents, context));

      executionState.value.currentStep = completedAgents.value;

      if (stepResult.response) {
        const currentNode = engine.getCurrentNode();
        const agent = stepResult.response.agent ?? (currentNode?.type === 'agent' ? currentNode.agent : undefined);
        const responseWithAgent: IAgentResponse = stepResult.response;
        responseWithAgent.agent = agent;

        executionState.value.lastResponse = responseWithAgent;
        executionState.value.isWaitingForConfirmation = stepResult.hasNext;

        const enhancedResponse: IAgentResponse = responseWithAgent;
        enhancedResponse.workflowControl = {
          isMultiStep: true,
          currentStep: executionState.value.currentStep,
          totalSteps: executionState.value.totalSteps,
          hasNext: stepResult.hasNext,
          currentNodeId: currentNode?.id,
          nextNodeId: stepResult.nextNodeId,
          nextAgent: stepResult.nextNodeId
            ? workflow.nodes.find(n => n.id === stepResult.nextNodeId)?.agent
            : undefined,
          workflowId: workflow.id,
          secondaryAction: resolveSecondaryAction(currentNode?.config)
        };

        history.value.push({ role: 'assistant', content: enhancedResponse.content });
        return enhancedResponse;
      }

      // 工作流完成但没有响应（可能只有控制节点）
      if (!stepResult.hasNext) {
        const final = engine.getFinalResponse(true);
        const completedResponse: IAgentResponse = {
          content: final.content || '工作流已完成',
          type: 'text',
          workflowControl: {
            isMultiStep: true,
            currentStep: executionState.value.totalSteps,
            totalSteps: executionState.value.totalSteps,
            hasNext: false
          }
        };
        history.value.push({ role: 'assistant', content: completedResponse.content });
        executionState.value = createInitialExecutionState();
        return completedResponse;
      }

      throw new Error('工作流执行失败');

    } catch (e) {
      console.error('[StepOrchestrator] Task failed:', e);
      const message = e instanceof Error ? e.message : String(e);
      return { content: message || '执行出错', type: 'text', isError: true };
    }
  };

  const applyAndContinue = async (
    data: unknown,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse | null> => {
    const state = executionState.value;
    if (!state.engine || !state.isWaitingForConfirmation || !state.lastResponse) {
      return null;
    }

    try {
      const payloadObj = asRecord(data) ?? {};
      const workflowActionValue = payloadObj.workflowAction;
      const workflowAction = asRecord(workflowActionValue);
      const applyPayload: Record<string, JsonValue> = {};
      for (const [key, value] of Object.entries(payloadObj)) {
        if (key === 'workflowAction') continue;
        applyPayload[key] = value;
      }

      if (state.lastResponse.agent && Object.keys(applyPayload).length > 0) {
        applyAgentData(state.lastResponse.agent, aiContext, applyPayload);
        await nextTick();
        await waitForPaint();
      }

      if (pickString(workflowAction, 'kind') === 'skip') {
        const targetNodeId = pickString(workflowAction, 'targetNodeId');
        state.engine.skipToNode(targetNodeId);
      }

      const context = buildChatContext({
        input: state.lastInput || '',
        aiContext,
        history: history.value,
        attachments: state.lastAttachments || []
      });

      const completedAgents = { value: 0 };
      const stepResult = await state.engine.continueExecution(state.lastInput || '', context, (_nodeId: string, partial: Partial<IAgentResponse>) => {
        const currentNode = state.engine?.getCurrentNode();
        onStream?.({ ...partial, agent: currentNode?.agent });
      }, createStepEngineOptions(completedAgents, context));

      if (stepResult.response) {
        const currentNode = state.engine.getCurrentNode();
        const agent = stepResult.response.agent ?? (currentNode?.type === 'agent' ? currentNode.agent : undefined);
        const responseWithAgent: IAgentResponse = stepResult.response;
        responseWithAgent.agent = agent;

        state.currentStep += completedAgents.value;
        state.lastResponse = responseWithAgent;
        state.isWaitingForConfirmation = stepResult.hasNext;

        const nextNode = state.engine.getNextNode();
        const enhancedResponse: IAgentResponse = responseWithAgent;
        enhancedResponse.workflowControl = {
          isMultiStep: true,
          currentStep: state.currentStep,
          totalSteps: state.totalSteps,
          hasNext: stepResult.hasNext,
          currentNodeId: currentNode?.id,
          nextNodeId: stepResult.nextNodeId,
          nextAgent: nextNode?.type === 'agent' ? nextNode.agent : undefined,
          workflowId: state.workflowId,
          secondaryAction: resolveSecondaryAction(currentNode?.config)
        };

        history.value.push({ role: 'assistant', content: enhancedResponse.content });
        return enhancedResponse;
      }

      if (!stepResult.hasNext) {
        state.currentStep += completedAgents.value;
        const final = state.engine.getFinalResponse(true);
        const actionLabel = pickString(workflowAction, 'kind') === 'skip'
          ? (pickString(workflowAction, 'label') || '')
          : '';
        const completedResponse: IAgentResponse = {
          content: actionLabel ? `已应用并${actionLabel}` : (final.content || '工作流已完成'),
          type: 'text',
          agent: final.agent || 'orchestrator',
          workflowControl: {
            isMultiStep: true,
            currentStep: state.totalSteps,
            totalSteps: state.totalSteps,
            hasNext: false,
            workflowId: state.workflowId
          }
        };
        history.value.push({ role: 'assistant', content: completedResponse.content });

        executionState.value = createInitialExecutionState();

        return completedResponse;
      }

      state.isWaitingForConfirmation = false;
      return null;

    } catch (e) {
      console.error('[StepOrchestrator] Continue failed:', e);
      const message = e instanceof Error ? e.message : String(e);
      return { content: message || '继续执行出错', type: 'text', isError: true };
    }
  };

  const resetExecution = () => {
    executionState.value = createInitialExecutionState();
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
