import type { IWorkflowGraph, IWorkflowMatchRule } from './types';
import type { AgentRole } from '../../types';

export class WorkflowGraphBuilder {
  private graph: Partial<IWorkflowGraph> = {
    nodes: [],
    edges: []
  };

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

  addStartNode(id: string = 'start', label: string = '开始', position?: { x: number; y: number }): this {
    const nodes = this.graph.nodes ?? (this.graph.nodes = []);
    nodes.push({
      id,
      type: 'start',
      label,
      position: position || { x: 0, y: 0 }
    });
    this.graph.startNodeId = id;
    return this;
  }

  addAgentNode(
    id: string,
    agent: AgentRole,
    label?: string,
    position?: { x: number; y: number },
    config?: Record<string, unknown>
  ): this {
    const nodes = this.graph.nodes ?? (this.graph.nodes = []);
    nodes.push({
      id,
      type: 'agent',
      agent,
      label: label || agent,
      position: position || { x: 0, y: 0 },
      config: config || {}
    });
    return this;
  }

  addConditionNode(
    id: string,
    condition: (context: Record<string, unknown>) => boolean,
    label: string = '条件判断',
    position?: { x: number; y: number }
  ): this {
    const nodes = this.graph.nodes ?? (this.graph.nodes = []);
    nodes.push({
      id,
      type: 'condition',
      label,
      condition,
      position: position || { x: 0, y: 0 }
    });
    return this;
  }

  addParallelNode(
    id: string,
    label: string = '并行执行',
    position?: { x: number; y: number }
  ): this {
    const nodes = this.graph.nodes ?? (this.graph.nodes = []);
    nodes.push({
      id,
      type: 'parallel',
      label,
      position: position || { x: 0, y: 0 }
    });
    return this;
  }

  addMergeNode(
    id: string,
    label: string = '合并',
    position?: { x: number; y: number }
  ): this {
    const nodes = this.graph.nodes ?? (this.graph.nodes = []);
    nodes.push({
      id,
      type: 'merge',
      label,
      position: position || { x: 0, y: 0 }
    });
    return this;
  }

  addEndNode(id: string = 'end', label: string = '结束', position?: { x: number; y: number }): this {
    const nodes = this.graph.nodes ?? (this.graph.nodes = []);
    nodes.push({
      id,
      type: 'end',
      label,
      position: position || { x: 0, y: 0 }
    });
    return this;
  }

  addEdge(
    source: string,
    target: string,
    condition?: string,
    weight?: number
  ): this {
    const edgeId = `${source}->${target}`;
    const edges = this.graph.edges ?? (this.graph.edges = []);
    edges.push({
      id: edgeId,
      source,
      target,
      condition,
      weight
    });
    return this;
  }

  setMatchRule(rule: IWorkflowMatchRule): this {
    this.graph.matchRule = rule;
    return this;
  }

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
