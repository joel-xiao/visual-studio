import type { Component as VueComponent } from 'vue';
import type { IAgent, AgentRole } from '../types';
import type { IAgentSchema } from './types';
import type { IAIContext } from '../hooks/core/use-ai-context';

const schemaModules = import.meta.glob<{ default: IAgentSchema }>(
  './*/schema.ts',
  { eager: true }
);

const useModules = import.meta.glob<{ [key: string]: () => IAgent }>(
  './*/use.ts',
  { eager: true }
);

const applyModules = import.meta.glob<{ apply: (context: IAIContext, data: unknown) => void }>(
  './*/apply.ts',
  { eager: true }
);

const componentModules = import.meta.glob<VueComponent>(
  './*/index.vue',
  { eager: true, import: 'default' }
);

const schemaMap: Record<AgentRole, IAgentSchema> = {} as Record<AgentRole, IAgentSchema>;
const useMap: Record<AgentRole, () => IAgent> = {} as Record<AgentRole, () => IAgent>;
const applyMap: Record<AgentRole, (context: IAIContext, data: unknown) => void> = {} as Record<AgentRole, (context: IAIContext, data: unknown) => void>;
const componentMap: Record<AgentRole, VueComponent> = {} as Record<AgentRole, VueComponent>;

Object.entries(schemaModules).forEach(([path, module]) => {
  const match = path.match(/\.\/([^/]+)\/schema\.ts$/);
  if (match && module?.default) {
    const agentRole = match[1] as AgentRole;
    schemaMap[agentRole] = module.default;
  }
});

Object.entries(useModules).forEach(([path, module]) => {
  const match = path.match(/\.\/([^/]+)\/use\.ts$/);
  if (match && module) {
    const agentRole = match[1] as AgentRole;
    const useFnName = `use${agentRole.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`;
    const useFn = (module as Record<string, unknown>)[useFnName] ||
                  (module as Record<string, unknown>).default ||
                  Object.values(module).find(v => typeof v === 'function');
    if (typeof useFn === 'function') {
      useMap[agentRole] = useFn as () => IAgent;
    }
  }
});

Object.entries(applyModules).forEach(([path, module]) => {
  const match = path.match(/\.\/([^/]+)\/apply\.ts$/);
  if (match && module?.apply) {
    const agentRole = match[1] as AgentRole;
    applyMap[agentRole] = module.apply;
  }
});

Object.entries(componentModules).forEach(([path, component]) => {
  const match = path.match(/\.\/([^/]+)\/index\.vue$/);
  if (match && component) {
    const agentRole = match[1] as AgentRole;
    componentMap[agentRole] = component;
  }
});

schemaMap['orchestrator'] = {
  id: 'orchestrator',
  role: 'orchestrator',
  name: 'Orchestrator',
  displayName: '编排器',
  description: 'Coordinates agent execution',
  icon: 'mdi:robot-outline',
  color: '#9b59b6',
  routing: {
    keywords: [],
    priorityRules: {},
    routingPrompt: () => ''
  },
  prompts: {},
  messages: {}
};

export function registerAgents(): Record<AgentRole, IAgent> {
  const agents: Record<string, IAgent> = {};

  Object.entries(useMap).forEach(([role, useFn]) => {
    if (useFn) {
      agents[role] = useFn();
    }
  });

  return agents as Record<AgentRole, IAgent>;
}

export function getAgentSchemas(): Map<AgentRole, IAgentSchema> {
  const schemas = new Map<AgentRole, IAgentSchema>();
  Object.entries(schemaMap).forEach(([role, schema]) => {
    schemas.set(role as AgentRole, schema);
  });
  return schemas;
}

export function getAgentSchema(role: AgentRole): IAgentSchema | null {
  return schemaMap[role] || null;
}

export function getAgentInfo(): Array<{ role: AgentRole; name: string; displayName: string; description: string }> {
  return Array.from(getAgentSchemas().values()).map(schema => ({
    role: schema.role,
    name: schema.name,
    displayName: schema.displayName,
    description: schema.description
  }));
}

export function matchAgentByRules(input: string): AgentRole | null {
  const lowerInput = input.toLowerCase();
  const schemas = getAgentSchemas();

  const matches: Array<{ role: AgentRole; count: number }> = [];

  schemas.forEach((schema, role) => {
    if (role === 'orchestrator') return;

    const count = schema.routing.keywords.filter(keyword =>
      lowerInput.includes(keyword.toLowerCase())
    ).length;

    if (count > 0) {
      matches.push({ role, count });
    }
  });

  if (matches.length === 0) {
    return null;
  }

  matches.sort((a, b) => b.count - a.count);
  return matches[0].role;
}

export function generateRoutingPrompt(context: unknown): string {
  const schemas = getAgentSchemas();
  const contextObj = context && typeof context === 'object' ? context as Record<string, unknown> : {};
  const selectedNodes = (Array.isArray(contextObj.selectedNodes) ? contextObj.selectedNodes : []) as Array<{ name?: string; id?: string }>;

  let prompt = `你是 AI 大屏设计团队的指挥官 (Orchestrator)。
请根据用户的需求，将任务分发给最合适的专家 Agent。

### 专家团队:
`;

  schemas.forEach((schema, role) => {
    if (role === 'orchestrator') return;
    prompt += schema.routing.routingPrompt('', contextObj) + '\n';
  });

  prompt += `\n### 当前上下文:
`;

  if (selectedNodes.length > 0) {
    const firstNode = selectedNodes[0];
    prompt += `**当前选中组件**: ${firstNode.name || 'Unknown'} (ID: ${firstNode.id || 'Unknown'}).\n`;
  } else {
    prompt += `**未选中组件** (全局模式)。\n`;
  }

  const agentRoles = Array.from(schemas.keys()).filter(r => r !== 'orchestrator');
  prompt += `\n请返回唯一的 JSON 格式决策 (不要解释):
{"agent": "${agentRoles.join('|')}", "refinedInput": "提炼后的用户指令"}`;

  return prompt;
}

export function applyAgentData(agentRole: AgentRole, context: IAIContext, data: unknown): void {
  const applyFn = applyMap[agentRole];
  if (!applyFn) {
    console.warn(`[AgentRegistry] No apply function found for agent: ${agentRole}`);
    return;
  }

  try {
    applyFn(context, data);
  } catch (error) {
    console.error(`[AgentRegistry] Failed to apply data for ${agentRole}:`, error);
  }
}

export function getAgentComponent(role: AgentRole): VueComponent | null {
  return componentMap[role] || null;
}

export function getAgentComponentByMessageType(messageType: string): VueComponent | null {
  const typeToRoleMap: Record<string, AgentRole> = {
    'chart': 'chart-creator',
    'theme-selection': 'theme-engine'
  };

  const role = typeToRoleMap[messageType];
  if (role) {
    return getAgentComponent(role);
  }

  return null;
}
