import type { Component as VueComponent } from 'vue';
import type { JsonValue } from '../../../../@types/utils';
import type { IAgent, AgentRole, AgentContext } from '../types';
import type { IAgentSchema } from './types';
import type { IAIContext } from '../hooks/core/use-ai-context';

const schemaModules = import.meta.glob<{ default: IAgentSchema }>('./*/schema.ts', { eager: true });
const useModules = import.meta.glob<{ [key: string]: () => IAgent }>('./*/use.ts', { eager: true });
const applyModules = import.meta.glob<{ apply: (context: IAIContext, data: JsonValue) => void }>('./*/apply.ts', { eager: true });
const componentModules = import.meta.glob<VueComponent>('./*/index.vue', { eager: true, import: 'default' });

const schemaMap: Record<string, IAgentSchema> = {};
const agentMap: Record<string, IAgent> = {};
const applyMap: Record<string, (context: IAIContext, data: JsonValue) => void> = {};
const componentMap: Record<string, VueComponent> = {};

Object.entries(schemaModules).forEach(([path, mod]) => {
  const role = path.split('/')[1];
  if (mod.default) {
    schemaMap[role] = mod.default;
  }
});

Object.entries(useModules).forEach(([path, mod]) => {
  const role = path.split('/')[1];
  const useFn = Object.values(mod).find((v): v is () => IAgent => typeof v === 'function');
  if (useFn) agentMap[role] = useFn();
});

Object.entries(applyModules).forEach(([path, mod]) => {
  const role = path.split('/')[1];
  if (mod.apply) applyMap[role] = mod.apply;
});

Object.entries(componentModules).forEach(([path, comp]) => {
  const role = path.split('/')[1];
  if (comp) componentMap[role] = comp;
});

export function registerAgents() { return agentMap as Record<AgentRole, IAgent>; }
export function getAgentSchemas() { return new Map(Object.entries(schemaMap)) as Map<AgentRole, IAgentSchema>; }
export function getAgentSchema(role: AgentRole) {
  if (role === 'orchestrator') {
    const schema: IAgentSchema = {
      id: 'orchestrator',
      role: 'orchestrator',
      name: 'Orchestrator',
      displayName: '编排器',
      description: 'Routes tasks to the best agent or workflow.',
      icon: 'mdi:robot-outline',
      color: '#9b59b6',
      routing: {
        hints: [],
        tags: [],
        intent: '任务分发',
        priorityRules: {},
        routingPrompt: (_agentList: string, _context: AgentContext) => ''
      },
      prompts: {}
    };
    return schema;
  }
  return schemaMap[role] || null;
}

export function getAgentComponent(role: AgentRole) { return componentMap[role] || null; }

export function getAgentInfo() {
  return Object.values(schemaMap).map(s => ({
    role: s.role as AgentRole,
    name: s.name,
    displayName: s.displayName,
    description: s.description,
    intent: s.routing.intent,
    hints: s.routing.hints || [],
    tags: s.routing.tags || []
  }));
}

export function applyAgentData(role: AgentRole, context: IAIContext, data: JsonValue) {
  const applyFn = applyMap[role];
  if (applyFn) applyFn(context, data);
}
