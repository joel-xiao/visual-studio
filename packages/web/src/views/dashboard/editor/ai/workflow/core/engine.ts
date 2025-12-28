import type {
  IWorkflowGraph,
  IWorkflowNode,
  IWorkflowEdge,
  IWorkflowExecutionContext,
  IWorkflowExecutionResult
} from './types';
import type { IAgent, AgentRole, IAgentResponse } from '../../types';
import { registerAgents } from '../../agent/registry';

/**
 * 工作流执行引擎
 */
export class WorkflowEngine {
  private agents: Record<AgentRole, IAgent>;
  private graph: IWorkflowGraph;
  private executionContext: IWorkflowExecutionContext | null = null;

  constructor(graph: IWorkflowGraph) {
    this.graph = graph;
    this.agents = registerAgents();
  }

  /**
   * 获取节点
   */
  private getNode(nodeId: string): IWorkflowNode | undefined {
    return this.graph.nodes.find(n => n.id === nodeId);
  }

  /**
   * 获取节点的出边
   */
  private getOutgoingEdges(nodeId: string): IWorkflowEdge[] {
    return this.graph.edges.filter(e => e.source === nodeId);
  }

  /**
   * 获取节点的入边
   */
  private getIncomingEdges(nodeId: string): IWorkflowEdge[] {
    return this.graph.edges.filter(e => e.target === nodeId);
  }

  /**
   * 检查节点是否所有前置节点都已完成
   */
  private areAllPredecessorsCompleted(nodeId: string): boolean {
    const incomingEdges = this.getIncomingEdges(nodeId);
    if (incomingEdges.length === 0) return true;

    const visitedNodes = this.executionContext!.visitedNodes;
    return incomingEdges.every(edge => visitedNodes.has(edge.source));
  }

  /**
   * 执行 Agent 节点
   */
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

    const response = await agent.process(
      context.input || '',
      {
        ...context,
        workflowNodeId: node.id,
        workflowData: this.executionContext!.data
      },
      onStream
    );

    return response;
  }

  /**
   * 执行条件节点
   */
  private executeConditionNode(node: IWorkflowNode, context: any): boolean {
    if (!node.condition) {
      throw new Error(`Condition node ${node.id} must have a condition function`);
    }
    return node.condition(context);
  }

  /**
   * 执行节点
   */
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
          // 开始节点，直接返回
          break;

        case 'agent':
          response = await this.executeAgentNode(node, context, onStream);
          if (response && response.data) {
            // 合并数据
            this.executionContext!.data = {
              ...this.executionContext!.data,
              ...response.data
            };
          }
          break;

        case 'condition': {
          // 条件节点不返回响应，只记录结果
          const conditionResult = this.executeConditionNode(node, context);
          this.executionContext!.data[`${node.id}_result`] = conditionResult;
          break;
        }

        case 'parallel':
          // 并行节点，需要等待所有分支完成
          // 这里返回 null，由 execute 方法处理并行逻辑
          break;

        case 'merge':
          // 合并节点，合并所有并行分支的数据
          break;

        case 'end':
          // 结束节点
          break;
      }

      // 记录执行历史
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

  /**
   * 获取下一个要执行的节点
   */
  private getNextNodes(currentNodeId: string, context: any): IWorkflowNode[] {
    const currentNode = this.getNode(currentNodeId);
    if (!currentNode) {
      return [];
    }

    const outgoingEdges = this.getOutgoingEdges(currentNodeId);
    const nextNodes: IWorkflowNode[] = [];

    if (currentNode.type === 'condition') {
      // 条件节点：根据条件结果选择路径
      const conditionResult = this.executionContext!.data[`${currentNodeId}_result`];
      for (const edge of outgoingEdges) {
        if (edge.condition === String(conditionResult)) {
          const nextNode = this.getNode(edge.target);
          if (nextNode) {
            nextNodes.push(nextNode);
          }
        }
      }
    } else if (currentNode.type === 'parallel') {
      // 并行节点：返回所有出边的目标节点
      for (const edge of outgoingEdges) {
        const nextNode = this.getNode(edge.target);
        if (nextNode) {
          nextNodes.push(nextNode);
        }
      }
    } else if (currentNode.type === 'merge') {
      // 合并节点：检查是否所有并行分支都已完成
      const incomingEdges = this.getIncomingEdges(currentNodeId);
      const allCompleted = incomingEdges.every(edge =>
        this.executionContext!.visitedNodes.has(edge.source)
      );

      if (allCompleted) {
        // 所有分支都完成，继续执行
        for (const edge of outgoingEdges) {
          const nextNode = this.getNode(edge.target);
          if (nextNode) {
            nextNodes.push(nextNode);
          }
        }
      }
    } else {
      // 普通节点：返回所有出边的目标节点
      for (const edge of outgoingEdges) {
        const nextNode = this.getNode(edge.target);
        if (nextNode) {
          nextNodes.push(nextNode);
        }
      }
    }

    return nextNodes;
  }

  /**
   * 执行工作流
   */
  async execute(
    input: string,
    context: any = {},
    onStream?: (nodeId: string, partial: Partial<IAgentResponse>) => void
  ): Promise<IWorkflowExecutionResult> {
    // 初始化执行上下文
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

        if (!currentNode) {
          throw new Error(`Node ${currentNodeId} not found`);
        }

        // 检查前置条件
        if (!this.areAllPredecessorsCompleted(currentNodeId)) {
          // 前置节点未完成，重新加入队列
          nodeQueue.push(currentNodeId);
          continue;
        }

        // 跳过已访问的节点（除非是并行节点）
        if (this.executionContext.visitedNodes.has(currentNodeId) && currentNode.type !== 'merge') {
          continue;
        }

        executionPath.push(currentNodeId);
        this.executionContext.currentNodeId = currentNodeId;

        // 执行节点
        const wrappedOnStream = onStream
          ? (partial: Partial<IAgentResponse>) => onStream(currentNodeId, partial)
          : undefined;

        await this.executeNode(currentNode, { ...context, input }, wrappedOnStream);

        // 获取下一个节点
        const nextNodes = this.getNextNodes(currentNodeId, context);

        // 如果是并行节点，所有分支都加入队列
        if (currentNode.type === 'parallel') {
          nodeQueue.push(...nextNodes.map(n => n.id));
        } else {
          // 普通节点，按顺序执行
          for (const nextNode of nextNodes) {
            if (!this.executionContext.visitedNodes.has(nextNode.id)) {
              nodeQueue.push(nextNode.id);
            }
          }
        }

        // 检查是否到达结束节点
        if (currentNode.type === 'end') {
          break;
        }
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

  /**
   * 获取执行上下文
   */
  getExecutionContext(): IWorkflowExecutionContext | null {
    return this.executionContext;
  }

  /**
   * 取消执行
   */
  cancel(): void {
    if (this.executionContext) {
      this.executionContext.status = 'cancelled';
    }
  }
}

