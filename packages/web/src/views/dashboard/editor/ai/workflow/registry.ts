import type { IWorkflowGraph } from './core/types';
import type { AgentRole } from '../types';

export class WorkflowRegistry {
  private static workflows = new Map<string, () => IWorkflowGraph>();
  private static workflowCreators = new Map<string, (args?: unknown) => IWorkflowGraph>();
  private static initialized = false;

  private static discoverWorkflows() {
    const workflowModules = import.meta.glob<{ [key: string]: (...args: unknown[]) => IWorkflowGraph }>(
      './workflows/*.ts',
      { eager: true }
    );

    Object.entries(workflowModules).forEach(([path, module]) => {
      if (path.includes('index.ts')) return;
      const match = path.match(/\.\/workflows\/([^/]+)\.ts$/);
      if (!match) return;

      const workflowId = match[1];
      const moduleExports = module as Record<string, unknown>;
      const createFnName = Object.keys(moduleExports).find(
        key => key.startsWith('create') && key.endsWith('Workflow') && typeof moduleExports[key] === 'function'
      );

      if (createFnName) {
        const createFn = moduleExports[createFnName] as (...args: unknown[]) => IWorkflowGraph;
        const paramCount = createFn.length;

        if (paramCount === 0) {
          this.register(workflowId, () => createFn());
        } else {
          this.registerCreator(workflowId, (args?: unknown) => createFn(args));
        }
      }
    });
  }

  static init() {
    if (this.initialized) return;
    this.discoverWorkflows();
    this.initialized = true;
  }

  static register(id: string, creator: () => IWorkflowGraph) {
    this.workflows.set(id, creator);
  }

  static registerCreator(id: string, creator: (args?: unknown) => IWorkflowGraph) {
    this.workflowCreators.set(id, creator);
  }

  static get(id: string, args?: unknown): IWorkflowGraph | null {
    const fixedCreator = this.workflows.get(id);
    if (fixedCreator) {
      return fixedCreator();
    }

    const dynamicCreator = this.workflowCreators.get(id);
    if (dynamicCreator) {
      return dynamicCreator(args);
    }

    return null;
  }

  static getAllIds(): string[] {
    return [
      ...Array.from(this.workflows.keys()),
      ...Array.from(this.workflowCreators.keys())
    ];
  }

  static has(id: string): boolean {
    return this.workflows.has(id) || this.workflowCreators.has(id);
  }

  static createSimpleAgent(agentRole: AgentRole): IWorkflowGraph {
    const workflow = this.get('simple-agent', agentRole);
    if (!workflow) {
      throw new Error(`Failed to create simple-agent workflow for ${agentRole}`);
    }
    return workflow;
  }
}

WorkflowRegistry.init();
