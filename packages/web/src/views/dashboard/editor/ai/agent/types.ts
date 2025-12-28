import type { AgentRole } from '../types';

export interface IRoutingRules {
  keywords: string[];
  priorityRules: {
    withSelection?: string;
    withoutSelection?: string;
  };
  routingPrompt: (agentList: string, context: any) => string;
}

export interface IAgentSchema {
  id: string;
  role: AgentRole;
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  color?: string;
  routing: IRoutingRules;
  prompts: Record<string, (...args: any[]) => string>;
  messages: Record<string, string | ((...args: any[]) => string)>;
  config?: Record<string, any>;
}

export interface IAgentModule {
  schema: IAgentSchema;
  process: (input: string, context?: any, onStream?: (partial: any) => void) => Promise<any>;
}
