import type {
  IWorkflowGraph,
  IWorkflowNode,
  IWorkflowEdge,
  IWorkflowExecutionContext
} from './types';
import type { IAgent, AgentRole, IAgentResponse, AgentContext } from '../../types';
import { registerAgents } from '../../agent/registry';
import { asRecord } from '../../utils/json-utils';
import type { JsonValue } from '../../../../../@types/utils';

export class StepWorkflowEngine {
  private agents: Record<AgentRole, IAgent>;
  private graph: IWorkflowGraph;
  private executionContext: IWorkflowExecutionContext | null = null;
  private currentNodeQueue: string[] = [];

  constructor(graph: IWorkflowGraph) {
    this.graph = graph;
    this.agents = registerAgents();
  }

  private requireExecutionContext(): IWorkflowExecutionContext {
    if (!this.executionContext) throw new Error('Workflow execution context not initialized');
    return this.executionContext;
  }

  private getOutgoingEdges(nodeId: string): IWorkflowEdge[] {
    return this.graph.edges.filter(e => e.source === nodeId);
  }

  private getIncomingEdges(nodeId: string): IWorkflowEdge[] {
    return this.graph.edges.filter(e => e.target === nodeId);
  }

  private areAllPredecessorsCompleted(nodeId: string): boolean {
    const incomingEdges = this.getIncomingEdges(nodeId);
    if (incomingEdges.length === 0) return true;

    const visitedNodes = this.requireExecutionContext().visitedNodes;
    return incomingEdges.every(edge => visitedNodes.has(edge.source));
  }

  private getNode(nodeId: string): IWorkflowNode | null {
    return this.graph.nodes.find(n => n.id === nodeId) || null;
  }

  private async executeAgentNode(
    node: IWorkflowNode,
    context: Record<string, unknown> & { input?: string },
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> {
    if (!node.agent) throw new Error(`Agent node ${node.id} must have an agent role`);

    const agent = this.agents[node.agent];
    if (!agent) throw new Error(`Agent ${node.agent} not found`);

    const exec = this.requireExecutionContext();
    const historySafe: JsonValue = exec.history.map(h => {
      const item: Record<string, JsonValue> = {
        nodeId: h.nodeId,
        timestamp: h.timestamp
      };
      if (h.response) {
        const resp: Record<string, JsonValue> = {
          content: h.response.content,
          type: h.response.type
        };
        if (h.response.data !== undefined) resp.data = h.response.data;
        item.response = resp;
      }
      if (h.error) item.error = h.error.message || String(h.error);
      return item;
    });

    const workflowContext: AgentContext = {
      ...(context as unknown as AgentContext),
      workflowNodeId: node.id,
      workflowData: exec.data as unknown as JsonValue,
      history: historySafe
    };

    const lastAgentItem = [...exec.history]
      .reverse()
      .find(h => {
        const prevNode = h.nodeId ? this.getNode(h.nodeId) : null;
        return prevNode?.type === 'agent' && h.response?.data;
      });

    if (lastAgentItem?.response?.data) {
      workflowContext.previousAgentData = lastAgentItem.response.data;
    }

    const input = typeof context.input === 'string' ? context.input : '';
    return await agent.process(input, workflowContext, onStream);
  }

  private executeConditionNode(node: IWorkflowNode, context: Record<string, unknown>): boolean {
    if (!node.condition) throw new Error(`Condition node ${node.id} must have a condition function`);
    return node.condition(context);
  }

  private async executeNode(
    node: IWorkflowNode,
    context: Record<string, unknown> & { input?: string },
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse | null> {
    const timestamp = Date.now();
    const exec = this.requireExecutionContext();

    try {
      let response: IAgentResponse | null = null;

      switch (node.type) {
        case 'start':
          break;

        case 'agent':
          response = await this.executeAgentNode(node, context, onStream);
          if (response?.data) exec.data = { ...exec.data, ...(asRecord(response.data) ?? {}) };
          break;

        case 'condition': {
          const conditionResult = this.executeConditionNode(node, context);
          exec.data[`${node.id}_result`] = conditionResult;
          break;
        }

        case 'parallel':
        case 'merge':
        case 'end':
          break;
      }

      exec.history.push({
        nodeId: node.id,
        timestamp,
        response: response || undefined
      });

      exec.visitedNodes.add(node.id);

      return response;
    } catch (error) {
      exec.history.push({
        nodeId: node.id,
        timestamp,
        error: error as Error
      });
      throw error;
    }
  }

  private getNextNodes(currentNodeId: string): IWorkflowNode[] {
    const currentNode = this.getNode(currentNodeId);
    if (!currentNode) return [];

    const outgoingEdges = this.getOutgoingEdges(currentNodeId);
    const nextNodes: IWorkflowNode[] = [];
    const exec = this.requireExecutionContext();

    if (currentNode.type === 'condition') {
      const conditionResult = exec.data[`${currentNodeId}_result`];
      for (const edge of outgoingEdges) {
        if (edge.condition === String(conditionResult)) {
          const nextNode = this.getNode(edge.target);
          if (nextNode) nextNodes.push(nextNode);
        }
      }
    } else if (currentNode.type === 'parallel' || currentNode.type === 'merge' || currentNode.type === 'agent' || currentNode.type === 'start') {
      if (currentNode.type === 'merge') {
        const incomingEdges = this.getIncomingEdges(currentNodeId);
        const allCompleted = incomingEdges.every(edge =>
          exec.visitedNodes.has(edge.source)
        );
        if (!allCompleted) return [];
      }

      for (const edge of outgoingEdges) {
        const nextNode = this.getNode(edge.target);
        if (nextNode) nextNodes.push(nextNode);
      }
    }

    return nextNodes;
  }

  private shouldStopOnAgent(
    node: IWorkflowNode,
    response: IAgentResponse,
    options?: {
      shouldStopOnAgent?: (node: IWorkflowNode, response: IAgentResponse) => boolean;
    }
  ) {
    if (!options?.shouldStopOnAgent) return true;
    return options.shouldStopOnAgent(node, response);
  }

  async executeStep(
    input: string,
    context: Record<string, unknown> = {},
    onStream?: (nodeId: string, partial: Partial<IAgentResponse>) => void,
    options?: {
      shouldStopOnAgent?: (node: IWorkflowNode, response: IAgentResponse) => boolean;
      onNodeComplete?: (nodeId: string, node: IWorkflowNode, response: IAgentResponse) => void | Promise<void>;
    }
  ): Promise<{ response: IAgentResponse | null; hasNext: boolean; nextNodeId?: string }> {
    if (!this.executionContext) {
      this.executionContext = {
        workflowId: this.graph.id,
        currentNodeId: this.graph.startNodeId,
        status: 'running',
        data: { ...context },
        history: [],
        visitedNodes: new Set()
      };
      this.currentNodeQueue = [this.graph.startNodeId];
    }

    // 循环执行直到找到一个agent节点或工作流结束
    while (this.currentNodeQueue.length > 0) {
      const currentNodeId = this.currentNodeQueue.shift();
      if (!currentNodeId) break;
      const currentNode = this.getNode(currentNodeId);

      if (!currentNode) throw new Error(`Node ${currentNodeId} not found`);

      if (!this.areAllPredecessorsCompleted(currentNodeId)) {
        this.currentNodeQueue.unshift(currentNodeId); // 放回队列前面
        continue;
      }

      const exec = this.requireExecutionContext();
      if (exec.visitedNodes.has(currentNodeId) && currentNode.type !== 'merge') {
        continue;
      }

      exec.currentNodeId = currentNodeId;

      const wrappedOnStream = onStream
        ? (partial: Partial<IAgentResponse>) => onStream(currentNodeId, partial)
        : undefined;

      const response = await this.executeNode(currentNode, { ...context, input }, wrappedOnStream);

      if (response && currentNode.type === 'agent') {
        await options?.onNodeComplete?.(currentNodeId, currentNode, response);
      }

      const nextNodes = this.getNextNodes(currentNodeId);

      if (currentNode.type === 'parallel') {
        this.currentNodeQueue.push(...nextNodes.map(n => n.id));
      } else {
        for (const nextNode of nextNodes) {
          if (!exec.visitedNodes.has(nextNode.id)) {
            this.currentNodeQueue.push(nextNode.id);
          }
        }
      }

      // 如果是agent节点且有响应，返回结果
      if (currentNode.type === 'agent' && response) {
        if (this.shouldStopOnAgent(currentNode, response, options)) {
          const hasNext = this.currentNodeQueue.length > 0 && !nextNodes.some(n => n.type === 'end');
          const nextNodeId = this.currentNodeQueue[0];
          return { response, hasNext, nextNodeId };
        }
      }

      // 如果是end节点，结束工作流
      if (currentNode.type === 'end') {
        exec.status = 'completed';
        return { response: null, hasNext: false };
      }

      // 其他类型节点继续循环
    }

    // 队列为空，工作流完成
    this.requireExecutionContext().status = 'completed';
    return { response: null, hasNext: false };
  }

  async continueExecution(
    input: string,
    context: Record<string, unknown> = {},
    onStream?: (nodeId: string, partial: Partial<IAgentResponse>) => void,
    options?: {
      shouldStopOnAgent?: (node: IWorkflowNode, response: IAgentResponse) => boolean;
      onNodeComplete?: (nodeId: string, node: IWorkflowNode, response: IAgentResponse) => void | Promise<void>;
    }
  ): Promise<{ response: IAgentResponse | null; hasNext: boolean; nextNodeId?: string }> {
    return this.executeStep(input, context, onStream, options);
  }

  hasNextStep(): boolean {
    return this.currentNodeQueue.length > 0 && this.executionContext?.status === 'running';
  }

  getCurrentNode(): IWorkflowNode | null {
    if (!this.executionContext) return null;
    return this.getNode(this.executionContext.currentNodeId);
  }

  getNextNode(): IWorkflowNode | null {
    if (this.currentNodeQueue.length === 0) return null;
    return this.getNode(this.currentNodeQueue[0]);
  }

  skipToNode(targetNodeId?: string): void {
    if (!this.executionContext) return;
    if (!targetNodeId) {
      this.currentNodeQueue = [];
      this.executionContext.status = 'completed';
      return;
    }

    const targetIndex = this.currentNodeQueue.indexOf(targetNodeId);
    if (targetIndex === -1) {
      if (this.getNode(targetNodeId)) {
        this.currentNodeQueue = [targetNodeId];
      } else {
        this.currentNodeQueue = [];
        this.executionContext.status = 'completed';
      }
      return;
    }

    const skipped = this.currentNodeQueue.slice(0, targetIndex);
    this.currentNodeQueue = this.currentNodeQueue.slice(targetIndex);

    const timestamp = Date.now();
    for (const nodeId of skipped) {
      if (this.executionContext.visitedNodes.has(nodeId)) continue;
      this.executionContext.visitedNodes.add(nodeId);
      this.executionContext.history.push({ nodeId, timestamp });
    }
  }

  getExecutionContext(): IWorkflowExecutionContext | null {
    return this.executionContext;
  }

  cancel(): void {
    if (this.executionContext) {
      this.executionContext.status = 'cancelled';
    }
  }

  getFinalResponse(success: boolean, error?: Error): IAgentResponse {
    if (!this.executionContext) {
      return {
        content: success ? '工作流执行完成' : `出错啦: ${error?.message || '未知错误'}`,
        type: 'text',
        isError: !success
      };
    }

    let lastAgentResponse: IAgentResponse | null = null;
    let finalAgentRole: AgentRole | undefined;

    for (let i = this.executionContext.history.length - 1; i >= 0; i--) {
      const item = this.executionContext.history[i];
      if (item.response) {
        if (!lastAgentResponse) lastAgentResponse = item.response;
        const node = this.getNode(item.nodeId);
        if (node?.agent && !finalAgentRole) {
          finalAgentRole = node.agent;
        }
        if (lastAgentResponse && finalAgentRole) break;
      }
    }

    return {
      content: lastAgentResponse?.content || (success ? '任务已完成' : `执行失败: ${error?.message}`),
      type: lastAgentResponse?.type || 'text',
      data: this.executionContext.data as unknown as JsonValue,
      agent: finalAgentRole,
      actions: lastAgentResponse?.actions,
      isError: !success
    };
  }
}
