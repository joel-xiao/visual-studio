import type { AgentRole } from '../types';

export interface IRoutingRules {
  hints: string[]; // 关键词线索，作为语义分析的补充参考
  tags: string[]; // 语义标签，用于意图打标
  intent: string; // 核心职能描述
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
  uiHints?: {
    fullWidth?: boolean;
    primaryActionText?: string;
    secondaryActionText?: string;
    applyStrategy?: 'manual' | 'auto';
  };
  prompts: Record<string, (...args: any[]) => string>;
  messages: Record<string, string | ((...args: any[]) => string)>;
  config?: Record<string, any>;
}

export interface IAgentModule {
  schema: IAgentSchema;
  process: (input: string, context?: any, onStream?: (partial: any) => void) => Promise<any>;
}
