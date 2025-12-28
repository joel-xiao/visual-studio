import { ref, computed } from 'vue';
import type { IWorkflowGraph, IWorkflowExecutionResult } from '../../workflow/core/types';
import { WorkflowEngine } from '../../workflow/core/engine';
import type { IAgentResponse } from '../../types';

/**
 * 工作流 Hook
 */
export function useWorkflow(graph: IWorkflowGraph) {
  const engine = ref<WorkflowEngine | null>(null);
  const executionResult = ref<IWorkflowExecutionResult | null>(null);
  const isRunning = ref(false);
  const error = ref<Error | null>(null);

  // 初始化引擎
  if (!engine.value) {
    engine.value = new WorkflowEngine(graph);
  }

  /**
   * 执行工作流
   */
  const execute = async (
    input: string,
    context: any = {},
    onStream?: (nodeId: string, partial: Partial<IAgentResponse>) => void
  ): Promise<IWorkflowExecutionResult> => {
    if (!engine.value) {
      throw new Error('Workflow engine not initialized');
    }

    isRunning.value = true;
    error.value = null;

    try {
      const result = await engine.value.execute(input, context, onStream);
      executionResult.value = result;
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      isRunning.value = false;
    }
  };

  /**
   * 取消执行
   */
  const cancel = () => {
    if (engine.value) {
      engine.value.cancel();
      isRunning.value = false;
    }
  };

  /**
   * 获取执行上下文
   */
  const getExecutionContext = () => {
    return engine.value?.getExecutionContext() || null;
  };

  /**
   * 重置工作流
   */
  const reset = () => {
    if (engine.value) {
      engine.value = new WorkflowEngine(graph);
    }
    executionResult.value = null;
    error.value = null;
    isRunning.value = false;
  };

  return {
    engine: computed(() => engine.value),
    executionResult: computed(() => executionResult.value),
    isRunning: computed(() => isRunning.value),
    error: computed(() => error.value),
    execute,
    cancel,
    getExecutionContext,
    reset
  };
}

