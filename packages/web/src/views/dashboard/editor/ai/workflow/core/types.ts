import type { AgentRole, IAgentResponse } from '../../types';

export type WorkflowNodeType =
  | 'agent'
  | 'condition'
  | 'parallel'
  | 'merge'
  | 'start'
  | 'end';

export interface IWorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  agent?: AgentRole;
  condition?: (context: any) => boolean;
  config?: Record<string, any>;
  position?: { x: number; y: number };
}

export interface IWorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  weight?: number;
}

export interface IWorkflowMatchRule {
  keywords?: string[];
  priority?: number;
}

export interface IWorkflowGraph {
  id: string;
  name: string;
  description?: string;
  nodes: IWorkflowNode[];
  edges: IWorkflowEdge[];
  startNodeId: string;
  matchRule?: IWorkflowMatchRule;
}

/**
 * 工作流执行状态
 */
export type WorkflowExecutionStatus =
  | 'pending'    // 等待执行
  | 'running'    // 执行中
  | 'completed'  // 已完成
  | 'failed'     // 失败
  | 'cancelled'; // 已取消

/**
 * 工作流执行上下文
 */
export interface IWorkflowExecutionContext {
  workflowId: string;
  currentNodeId: string;
  status: WorkflowExecutionStatus;
  data: Record<string, any>; // 累积的数据
  history: Array<{
    nodeId: string;
    timestamp: number;
    response?: IAgentResponse;
    error?: Error;
  }>;
  visitedNodes: Set<string>; // 已访问的节点
}

/**
 * 工作流执行结果
 */
export interface IWorkflowExecutionResult {
  success: boolean;
  status: WorkflowExecutionStatus;
  finalData: Record<string, any>;
  executionPath: string[]; // 执行的节点路径
  error?: Error;
}

