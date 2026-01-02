import type {
  IWorkflowGraph,
  IWorkflowNode,
  IWorkflowEdge,
  IWorkflowExecutionContext,
  IWorkflowExecutionResult
} from './types';
import type { IAgent, AgentRole, IAgentResponse } from '../../types';
import { registerAgents } from '../../agent/registry';

export class WorkflowEngine {
  private agents: Record<AgentRole, IAgent>;
  private graph: IWorkflowGraph;
  private executionContext: IWorkflowExecutionContext | null = null;

  constructor(graph: IWorkflowGraph) {
    this.graph = graph;
    this.agents = registerAgents();
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

    const visitedNodes = this.executionContext!.visitedNodes;
    return incomingEdges.every(edge => visitedNodes.has(edge.source));
  }

  private getNode(nodeId: string): IWorkflowNode | null {
    return this.graph.nodes.find(n => n.id === nodeId) || null;
  }

  private async executeAgentNode(
    node: IWorkflowNode,
    context: any,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> {
    if (!node.agent) {
      throw new Error(`Agent node ${node.id} must have an agent role`);
    }

    const agent = this.agents[node.agent];
    if (!agent) {
      throw new Error(`Agent ${node.agent} not found`);
    }

    const workflowContext: Record<string, unknown> = {
      ...context,
      workflowNodeId: node.id,
      workflowData: this.executionContext!.data,
      history: this.executionContext!.history
    };

    const lastAgentItem = [...this.executionContext!.history]
      .reverse()
      .find(h => {
        const prevNode = h.nodeId ? this.getNode(h.nodeId) : null;
        return prevNode?.type === 'agent' && h.response?.data;
      });

    if (lastAgentItem?.response?.data) {
      workflowContext.previousAgentData = lastAgentItem.response.data;
    }

    return await agent.process(
      context.input || '',
      workflowContext,
      onStream
    );
  }

  private executeConditionNode(node: IWorkflowNode, context: any): boolean {
    if (!node.condition) {
      throw new Error(`Condition node ${node.id} must have a condition function`);
    }
    return node.condition(context);
  }

  private async executeNode(
    node: IWorkflowNode,
    context: any,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse | null> {
    const timestamp = Date.now();

    try {
      let response: IAgentResponse | null = null;

      switch (node.type) {
        case 'start':
          break;

        case 'agent':
          response = await this.executeAgentNode(node, context, onStream);
          if (response?.data) {
            this.executionContext!.data = {
              ...this.executionContext!.data,
              ...response.data
            };
          }
          break;

        case 'condition': {
          const conditionResult = this.executeConditionNode(node, context);
          this.executionContext!.data[`${node.id}_result`] = conditionResult;
          break;
        }

        case 'parallel':
        case 'merge':
        case 'end':
          break;
      }

      this.executionContext!.history.push({
        nodeId: node.id,
        timestamp,
        response: response || undefined
      });

      this.executionContext!.visitedNodes.add(node.id);

      return response;
    } catch (error) {
      this.executionContext!.history.push({
        nodeId: node.id,
        timestamp,
        error: error as Error
      });
      throw error;
    }
  }

  private getNextNodes(currentNodeId: string, context: any): IWorkflowNode[] {
    const currentNode = this.getNode(currentNodeId);
    if (!currentNode) return [];

    const outgoingEdges = this.getOutgoingEdges(currentNodeId);
    const nextNodes: IWorkflowNode[] = [];

    if (currentNode.type === 'condition') {
      const conditionResult = this.executionContext!.data[`${currentNodeId}_result`];
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
          this.executionContext!.visitedNodes.has(edge.source)
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

  async execute(
    input: string,
    context: any = {},
    onStream?: (nodeId: string, partial: Partial<IAgentResponse>) => void,
    onNodeComplete?: (nodeId: string, response: IAgentResponse) => void | Promise<void>
  ): Promise<IWorkflowExecutionResult> {
    this.executionContext = {
      workflowId: this.graph.id,
      currentNodeId: this.graph.startNodeId,
      status: 'running',
      data: { ...context },
      history: [],
      visitedNodes: new Set()
    };

    const executionPath: string[] = [];
    const nodeQueue: string[] = [this.graph.startNodeId];

    try {
      while (nodeQueue.length > 0) {
        const currentNodeId = nodeQueue.shift()!;
        const currentNode = this.getNode(currentNodeId);

        if (!currentNode) throw new Error(`Node ${currentNodeId} not found`);

        if (!this.areAllPredecessorsCompleted(currentNodeId)) {
          nodeQueue.push(currentNodeId);
          continue;
        }

        if (this.executionContext.visitedNodes.has(currentNodeId) && currentNode.type !== 'merge') {
          continue;
        }

        executionPath.push(currentNodeId);
        this.executionContext.currentNodeId = currentNodeId;

        const wrappedOnStream = onStream
          ? (partial: Partial<IAgentResponse>) => onStream(currentNodeId, partial)
          : undefined;

        const response = await this.executeNode(currentNode, { ...context, input }, wrappedOnStream);

        if (response && onNodeComplete) {
          await onNodeComplete(currentNodeId, response);
        }

        const nextNodes = this.getNextNodes(currentNodeId, context);

        if (currentNode.type === 'parallel') {
          nodeQueue.push(...nextNodes.map(n => n.id));
        } else {
          for (const nextNode of nextNodes) {
            if (!this.executionContext.visitedNodes.has(nextNode.id)) {
              nodeQueue.push(nextNode.id);
            }
          }
        }

        if (currentNode.type === 'end') break;
      }

      this.executionContext.status = 'completed';

      return {
        success: true,
        status: 'completed',
        finalData: this.executionContext.data,
        executionPath
      };
    } catch (error) {
      this.executionContext.status = 'failed';
      return {
        success: false,
        status: 'failed',
        finalData: this.executionContext.data,
        executionPath,
        error: error as Error
      };
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
      data: this.executionContext.data,
      agent: finalAgentRole,
      actions: lastAgentResponse?.actions,
      isError: !success
    };
  }
}
