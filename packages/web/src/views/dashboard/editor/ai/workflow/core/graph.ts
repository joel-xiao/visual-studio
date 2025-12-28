import type { IWorkflowGraph, IWorkflowNode, IWorkflowEdge, IWorkflowMatchRule } from './types';
import type { AgentRole } from '../../types';

/**
 * 工作流图构建器
 */
export class WorkflowGraphBuilder {
  private graph: Partial<IWorkflowGraph> = {
    nodes: [],
    edges: []
  };

  /**
   * 设置工作流基本信息
   */
  setId(id: string): this {
    this.graph.id = id;
    return this;
  }

  setName(name: string): this {
    this.graph.name = name;
    return this;
  }

  setDescription(description: string): this {
    this.graph.description = description;
    return this;
  }

  /**
   * 添加开始节点
   */
  addStartNode(id: string = 'start', label: string = '开始', position?: { x: number; y: number }): this {
    this.graph.nodes!.push({
      id,
      type: 'start',
      label,
      position: position || { x: 0, y: 0 }
    });
    this.graph.startNodeId = id;
    return this;
  }

  /**
   * 添加 Agent 节点
   */
  addAgentNode(
    id: string,
    agent: AgentRole,
    label?: string,
    position?: { x: number; y: number }
  ): this {
    this.graph.nodes!.push({
      id,
      type: 'agent',
      agent,
      label: label || agent,
      position: position || { x: 0, y: 0 },
      config: {}
    });
    return this;
  }

  /**
   * 添加条件节点
   */
  addConditionNode(
    id: string,
    condition: (context: any) => boolean,
    label: string = '条件判断',
    position?: { x: number; y: number }
  ): this {
    this.graph.nodes!.push({
      id,
      type: 'condition',
      label,
      condition,
      position: position || { x: 0, y: 0 }
    });
    return this;
  }

  /**
   * 添加并行节点
   */
  addParallelNode(
    id: string,
    label: string = '并行执行',
    position?: { x: number; y: number }
  ): this {
    this.graph.nodes!.push({
      id,
      type: 'parallel',
      label,
      position: position || { x: 0, y: 0 }
    });
    return this;
  }

  /**
   * 添加合并节点
   */
  addMergeNode(
    id: string,
    label: string = '合并',
    position?: { x: number; y: number }
  ): this {
    this.graph.nodes!.push({
      id,
      type: 'merge',
      label,
      position: position || { x: 0, y: 0 }
    });
    return this;
  }

  /**
   * 添加结束节点
   */
  addEndNode(id: string = 'end', label: string = '结束', position?: { x: number; y: number }): this {
    this.graph.nodes!.push({
      id,
      type: 'end',
      label,
      position: position || { x: 0, y: 0 }
    });
    return this;
  }

  /**
   * 添加边（连接）
   */
  addEdge(
    source: string,
    target: string,
    condition?: string,
    weight?: number
  ): this {
    const edgeId = `${source}->${target}`;
    this.graph.edges!.push({
      id: edgeId,
      source,
      target,
      condition,
      weight
    });
    return this;
  }

  /**
   * 设置匹配规则
   */
  setMatchRule(rule: IWorkflowMatchRule): this {
    this.graph.matchRule = rule;
    return this;
  }

  /**
   * 构建工作流图
   */
  build(): IWorkflowGraph {
    if (!this.graph.id || !this.graph.name || !this.graph.startNodeId) {
      throw new Error('Workflow graph must have id, name, and startNodeId');
    }
    if (!this.graph.nodes || this.graph.nodes.length === 0) {
      throw new Error('Workflow graph must have at least one node');
    }
    return this.graph as IWorkflowGraph;
  }
}


