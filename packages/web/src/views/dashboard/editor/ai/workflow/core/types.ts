import type { AgentRole, IAgentResponse } from '../../types';

/**
 * 工作流节点类型
 */
export type WorkflowNodeType =
  | 'agent'      // Agent 节点
  | 'condition'  // 条件分支节点
  | 'parallel'   // 并行执行节点
  | 'merge'      // 合并节点
  | 'start'      // 开始节点
  | 'end';       // 结束节点

/**
 * 工作流节点
 */
export interface IWorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  agent?: AgentRole; // 当 type 为 'agent' 时使用
  condition?: (context: any) => boolean; // 当 type 为 'condition' 时使用
  config?: Record<string, any>; // 节点配置
  position?: { x: number; y: number }; // 可视化位置
}

/**
 * 工作流边（连接）
 */
export interface IWorkflowEdge {
  id: string;
  source: string; // 源节点 ID
  target: string; // 目标节点 ID
  condition?: string; // 条件标签（用于条件分支）
  weight?: number; // 权重（用于优先级）
}

/**
 * 工作流匹配规则
 */
export interface IWorkflowMatchRule {
  /**
   * 关键词列表（用于文本匹配）
   */
  keywords?: string[];

  /**
   * 匹配函数（用于复杂匹配逻辑）
   * @param input 用户输入
   * @param context 上下文信息
   * @returns 是否匹配
   */
  match?: (input: string, context: { selectedNodes?: unknown[]; nodes?: unknown[]; [key: string]: unknown }) => boolean;

  /**
   * 优先级（数字越大优先级越高）
   */
  priority?: number;
}

/**
 * 工作流图
 */
export interface IWorkflowGraph {
  id: string;
  name: string;
  description?: string;
  nodes: IWorkflowNode[];
  edges: IWorkflowEdge[];
  startNodeId: string; // 开始节点 ID
  /**
   * 匹配规则（用于工作流选择器自动匹配）
   */
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

